import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxSvgModule } from 'ngx-svg';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CustomerDashboardModule } from './customer-dashboard/customer-dashboard.module';
import { DynamicSvgDirective } from './dynamic-svg.directive';

@NgModule({
  declarations: [
    AppComponent,
    DynamicSvgDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CustomerDashboardModule,
    FontAwesomeModule,
    NgxSvgModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
