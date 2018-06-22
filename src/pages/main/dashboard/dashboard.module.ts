import { NgModule } from '@angular/core';
import { DashboardPage } from './dashboard';
import { IonicPageModule } from 'ionic-angular';

@NgModule({
  declarations: [
    DashboardPage,
  ],
  imports: [
    IonicPageModule.forChild(DashboardPage),
  ],
  exports: [
    DashboardPage
  ]
})
export class DashboardPageModule {}
