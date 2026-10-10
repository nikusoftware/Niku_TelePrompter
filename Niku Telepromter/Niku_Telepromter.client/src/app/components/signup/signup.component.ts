// ---------------------------------------
// Email: quickapp@ebenmonney.com
// Templates: www.nikutv.com/templates
// (c) 2024 www.nikutv.com/mit-license
// ---------------------------------------

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { AlertService, MessageSeverity } from '../../services/alert.service';
import { AccountService } from '../../services/account.service';
import { AccountEndpoint } from '../../services/account-endpoint.service';
import { Utilities } from '../../services/utilities';
import { UserSignUp } from '../../models/user-signup.model';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  standalone: true
})
export class SignupComponent implements OnInit, OnDestroy {
  private alertService = inject(AlertService);
  private accountService = inject(AccountService);
  private accountEndpoint = inject(AccountEndpoint);
  private router = inject(Router);

  userSignUp = new UserSignUp();
  isLoading = false;
  formResetToggle = true;
  private signUpStatusSubscription: Subscription | undefined;

  ngOnInit() {
    if (this.accountService.isLoggedIn) {
      this.router.navigate(['/']);
    }
  }

  ngOnDestroy() {
    this.signUpStatusSubscription?.unsubscribe();
  }

  signup() {
    if (!this.validatePassword()) {
      this.alertService.showMessage('Password Mismatch', 'Password and confirm password do not match', MessageSeverity.error);
      return;
    }

    if (!this.validateEmail()) {
      this.alertService.showMessage('Invalid Email', 'Please enter a valid email address', MessageSeverity.error);
      return;
    }

    this.isLoading = true;
    this.alertService.startLoadingMessage('', 'Creating account...');

    const signupData = {
      userName: this.userSignUp.userName,
      email: this.userSignUp.email,
      password: this.userSignUp.password,
      fullName: this.userSignUp.fullName,
      phoneNumber: this.userSignUp.phoneNumber
    };

    this.accountEndpoint.getSignUpEndpoint<any>(signupData).subscribe({
      next: (response) => {
        setTimeout(() => {
          this.alertService.stopLoadingMessage();
          this.isLoading = false;
          this.reset();

          this.alertService.showMessage(
            'Account Created',
            `Welcome ${this.userSignUp.userName}! Your account has been created successfully. Please log in.`,
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
          const errorMessage = error?.error?.message || 'An error occurred during signup. Please try again.';
          this.alertService.showMessage('Signup Failed', errorMessage, MessageSeverity.error);
        }
      }
    });
  }

  private validatePassword(): boolean {
    return !!(this.userSignUp.password && this.userSignUp.password === this.userSignUp.confirmPassword);
  }

  private validateEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.userSignUp.email);
  }

  private reset() {
    this.userSignUp = new UserSignUp();
    this.formResetToggle = false;
    setTimeout(() => {
      this.formResetToggle = true;
    });
  }
}
