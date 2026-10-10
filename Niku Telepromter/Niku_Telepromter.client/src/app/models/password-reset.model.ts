// ---------------------------------------
// Email: quickapp@ebenmonney.com
// Templates: www.nikutv.com/templates
// (c) 2024 www.nikutv.com/mit-license
// ---------------------------------------

export class ForgotPasswordRequest {
  email: string = '';
}

export class ResetPasswordRequest {
  email: string = '';
  token: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
}
