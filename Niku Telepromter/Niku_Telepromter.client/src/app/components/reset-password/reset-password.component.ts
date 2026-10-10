// ---------------------------------------
// Email: quickapp@ebenmonney.com
// Templates: www.nikutv.com/templates
// (c) 2024 www.nikutv.com/mit-license
// ---------------------------------------

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { AlertService, MessageSeverity } from '../../services/alert.service';
import { AccountService } from '../../services/account.service';
import { AccountEndpoint } from '../../services/account-endpoint.service';
import { Utilities } from '../../services/utilities';
import { ResetPasswordRequest } from '../../models/password-reset.model';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  standalone: true
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  private alertService = inject(AlertService);
  private accountService = inject(AccountService);
  private accountEndpoint = inject(AccountEndpoint);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  resetPasswordRequest = new ResetPasswordRequest();
  isLoading = false;
  formResetToggle = true;
  resetSuccessful = false;
  invalidToken = false;
  private resetPasswordSubscription: Subscription | undefined;

  ngOnInit() {
    if (this.accountService.isLoggedIn) {
      this.router.navigate(['/']);
      return;
    }

    // Get email and token from query parameters
    this.activatedRoute.queryParams.subscribe(params => {
      this.resetPasswordRequest.email = params['email'] || '';
      this.resetPasswordRequest.token = params['token'] || '';

      if (!this.resetPasswordRequest.email || !this.resetPasswordRequest.token) {
        this.invalidToken = true;
        this.alertService.showMessage(
          'Invalid Reset Link',
          'The password reset link is missing required parameters. Please request a new password reset link.',
          MessageSeverity.error
        );
      }
    });
  }

  ngOnDestroy() {
    this.resetPasswordSubscription?.unsubscribe();
  }

  resetPassword() {
    if (!this.validatePasswords()) {
      this.alertService.showMessage('Password Mismatch', 'Password and confirm password do not match', MessageSeverity.error);
      return;
    }

    if (!this.validatePasswordStrength()) {
      this.alertService.showMessage('Weak Password', 'Password must be at least 6 characters long', MessageSeverity.error);
      return;
    }

    if (!this.resetPasswordRequest.email || !this.resetPasswordRequest.token) {
      this.alertService.showMessage('Invalid Request', 'Reset token or email is missing', MessageSeverity.error);
      return;
    }

    this.isLoading = true;
    this.alertService.startLoadingMessage('', 'Resetting your password...');

    this.resetPasswordSubscription = this.accountEndpoint.getResetPasswordEndpoint<any>(this.resetPasswordRequest).subscribe({
      next: (response) => {
        setTimeout(() => {
          this.alertService.stopLoadingMessage();
          this.isLoading = false;

          this.resetSuccessful = true;
          this.alertService.showMessage(
            'Password Reset Successful',
            'Your password has been reset. You can now log in with your new password.',
            MessageSeverity.success
          );

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }, 500);
      },
      error: (error) => {
        this.alertService.stopLoadingMessage();
        this.isLoading = false;

        if (Utilities.checkNoNetwork(error)) {
          this.alertService.showStickyMessage(
            Utilities.noNetworkMessageCaption,
            Utilities.noNetworkMessageDetail,
            MessageSeverity.error,
            error
          );
        } else {
          const errorMessage = error?.error?.message || 'Failed to reset password. The reset link may have expired.';
          this.alertService.showMessage('Reset Failed', errorMessage, MessageSeverity.error);
          this.invalidToken = true;
        }
      }
    });
  }

  private validatePasswords(): boolean {
    return !!(this.resetPasswordRequest.newPassword && 
           this.resetPasswordRequest.newPassword === this.resetPasswordRequest.confirmPassword);
  }

  private validatePasswordStrength(): boolean {
    return !!(this.resetPasswordRequest.newPassword && this.resetPasswordRequest.newPassword.length >= 6);
  }

  requestNewLink() {
    this.router.navigate(['/forgot-password']);
  }
}
