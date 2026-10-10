// ---------------------------------------
// Email: quickapp@ebenmonney.com
// Templates: www.nikutv.com/templates
// (c) 2024 www.nikutv.com/mit-license
// ---------------------------------------

import { Utilities } from '../services/utilities';


export class Notification {
  public id = 0;
  public header = '';
  public body = '';
  public date = new Date();
  public isRead = false;
  public isPinned = false;

  public static Create(data: object) {
    const n = new Notification();
    Object.assign(n, data);

    if (n.date) {
      n.date = Utilities.parseDate(n.date);
    }

    return n;
  }
}
