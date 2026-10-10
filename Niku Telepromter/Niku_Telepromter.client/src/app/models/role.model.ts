// ---------------------------------------
// Email: quickapp@ebenmonney.com
// Templates: www.nikutv.com/templates
// (c) 2024 www.nikutv.com/mit-license
// ---------------------------------------

import { Permission } from './permission.model';

export class Role {
  constructor(
    public name = '',
    public description = '',
    public permissions: Permission[] = []
  ) { }

  public id = '';
  public usersCount = 0;
}
