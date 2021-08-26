import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { faDotCircle } from "@fortawesome/free-regular-svg-icons";
import { faBraille, faCog, faNewspaper, faThLarge, faUser } from "@fortawesome/free-solid-svg-icons";
import { Container, Element as SVGElement, Rect, SVG, Svg } from "@svgdotjs/svg.js";
import "@svgdotjs/svg.draggable.js";
import { SvgCircleDirective } from 'ngx-svg/src/app/modules/directives/svg-circle.directive';
import "./libs/svg.draw.js";
import "./libs/svg.select.js";
import "./libs/svg.resize.js";

interface Grid {
  width: number;
  height: number;
  strokeColor: string;
}

interface Rectangular {
  height: number;
  width: number;
  color: string;
  x: number;
  y: number;
  rx: number;
  ry: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  faCog = faCog;
  faThLarge = faThLarge;
  faUser = faUser;
  faNewspaper = faNewspaper;
  faBraille = faBraille;
  faDotCircle = faDotCircle;
  title = 'app';

  that = this;

  svgContainer: any = { width: 1920, height: 1080 };
  draw: Svg = new Svg();
  newDraw?: SVGElement;
  rect?: SVGElement;
  rectElements: SVGElement[] = [];
  grid: Grid = {
    width: 50,
    height: 50,
    strokeColor: '#00f'
  };

  /**
   * Globally used variables within the component.
   */
  rectangulars: Rectangular[] = [{
    height: 100,
    width: 200,
    color: 'rgba(125, 125, 32, 1)',
    x: 25,
    y: 25,
    rx: 0,
    ry: 0
  }];

  onMousedown(e: MouseEvent) {
    const isMouse = !e.type.indexOf('mouse');
    // Check for left button
    if (isMouse && (e.buttons) !== 1) {
        return;
    }
    this.rect = this.draw.rect().attr({ fill: '#f00' }).data('id', this.rectElements.length + 1).draggable();
    this.rect.on('mousedown', this.selected, this);
    this.newDraw = this.rect.draw(e);
    this.newDraw.on('drawstop', this.stopDrawing, this);
  }

  onMouseup(e: Event) {
    if(this.rect === undefined) return;

    this.rect!.draw('stop', e);

    this.unSelectAll();

    if (this.rect!.width() === 0 || this.rect!.height() === 0) {
      this.rect!.remove();
      return;
    }

    this.rectElements.push(this.rect!);

    this.rect!.fire('mousedown');

    // this.rect!.selectize();
  }

  private selected(e: Event) {
    e.stopPropagation();
    this.rect = undefined;
    this.newDraw = undefined;

    const target = SVG(e.target) as SVGElement;

    this.unSelectAll();

    target.selectize().resize();
  }

  private unSelectAll() {
    this.rectElements.forEach(element=>{
        element.selectize(false);
    });
  }

  private stopDrawing(e: any) {
    this.draw.off('mouseup');
  }

  ngAfterContentInit(): void {
    //Called after ngOnInit when the component's or directive's content has been initialized.
    //Add 'implements AfterContentInit' to the class.
  }

  ngOnInit() {
    this.draw = SVG('#editor').toRoot();

  }

  private endDrawing(e: any) {
    this.rect!.draw('stop', e);
  }

  onInitRect(e: any) {
    console.log('init rect', e);
    e.events.click = this.onClickRect;
  }

  onClickContainer(e: any) {
    console.log(e);
  }

  onClickRect(e: any) {
    // e.stopPropagation();
    console.log(e);
  }
}
