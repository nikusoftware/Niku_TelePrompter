// ---------------------------------------
// Email: quickapp@ebenmonney.com
// Templates: www.nikutv.com/templates
// (c) 2024 www.nikutv.com/mit-license
// ---------------------------------------

import { User } from './user.model';

export class UserEdit extends User {
  constructor(
    public currentPassword?: string,
    public newPassword?: string,
    public confirmPassword?: string) {
    super();
  }
}
