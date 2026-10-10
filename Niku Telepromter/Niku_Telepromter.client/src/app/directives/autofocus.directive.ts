// ---------------------------------------
// Email: quickapp@ebenmonney.com
// Templates: www.nikutv.com/templates
// (c) 2024 www.nikutv.com/mit-license
// ---------------------------------------

import { Directive, ElementRef, OnInit, inject } from '@angular/core';

@Directive({
  selector: '[appAutofocus]',
  standalone: true
})
export class AutofocusDirective implements OnInit {
  elementRef = inject(ElementRef);

  ngOnInit() {
    setTimeout(() => this.elementRef.nativeElement.focus(), 500);
  }
}
