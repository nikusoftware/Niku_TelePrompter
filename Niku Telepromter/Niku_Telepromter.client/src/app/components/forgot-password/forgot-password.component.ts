// ---------------------------------------
// Email: quickapp@ebenmonney.com
// Templates: www.nikutv.com/templates
// (c) 2024 www.nikutv.com/mit-license
// ---------------------------------------

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { AlertService, MessageSeverity } from '../../services/alert.service';
import { AccountService } from '../../services/account.service';
import { AccountEndpoint } from '../../services/account-endpoint.service';
import { Utilities } from '../../services/utilities';
import { ForgotPasswordRequest } from '../../models/password-reset.model';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  imports: [CommonModule, FormsModule, TranslateModule],
  standalone: true
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  private alertService = inject(AlertService);
  private accountService = inject(AccountService);
  private accountEndpoint = inject(AccountEndpoint);
  private router = inject(Router);

  forgotPasswordRequest = new ForgotPasswordRequest();
  isLoading = false;
  formResetToggle = true;
  passwordSent = false;
  private forgotPasswordSubscription: Subscription | undefined;

  ngOnInit() {
    if (this.accountService.isLoggedIn) {
      this.router.navigate(['/']);
    }
  }

  ngOnDestroy() {
    this.forgotPasswordSubscription?.unsubscribe();
  }

  submitEmail() {
    if (!this.validateEmail()) {
      this.alertService.showMessage('Invalid Email', 'Please enter a valid email address', MessageSeverity.error);
      return;
    }

    this.isLoading = true;
    this.alertService.startLoadingMessage('', 'Sending password reset email...');

    this.forgotPasswordSubscription = this.accountEndpoint.getForgotPasswordEndpoint<any>(this.forgotPasswordRequest.email).subscribe({
      next: (response) => {
        setTimeout(() => {
          this.alertService.stopLoadingMessage();
          this.isLoading = false;

          this.passwordSent = true;
          this.alertService.showMessage(
            'Password Reset Email Sent',
            `An email with password reset instructions has been sent to ${this.forgotPasswordRequest.email}`,
            MessageSeverity.success
          );
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
          const errorMessage = error?.error?.message || 'Failed to send password reset email. Please try again.';
          this.alertService.showMessage('Request Failed', errorMessage, MessageSeverity.error);
        }
      }
    });
  }

  private validateEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.forgotPasswordRequest.email);
  }

  backToLogin() {
    this.router.navigate(['/login']);
  }
}
