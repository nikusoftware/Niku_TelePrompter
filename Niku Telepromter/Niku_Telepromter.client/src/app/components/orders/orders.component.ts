// ---------------------------------------
// Email: quickapp@ebenmonney.com
// Templates: www.nikutv.com/templates
// (c) 2024 www.nikutv.com/mit-license
// ---------------------------------------

import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { fadeInOut } from '../../services/animations';

@Component({
    selector: 'app-orders',
    templateUrl: './orders.component.html',
    styleUrl: './orders.component.scss',
    animations: [fadeInOut],
    imports: [TranslateModule]
})
export class OrdersComponent {
}
