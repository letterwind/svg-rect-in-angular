import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appDynamicSvg]'
})
export class DynamicSvgDirective {

  constructor(private viewContainerRef: ViewContainerRef) { }

}
