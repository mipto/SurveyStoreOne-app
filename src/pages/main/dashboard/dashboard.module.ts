import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DashboardPage } from './dashboard';
// Import Chart 
import { ChartsModule } from 'ng2-charts/charts/charts';
import '../../../../node_modules/chart.js/dist/Chart.bundle.min.js'; 

@NgModule({
  declarations: [
    DashboardPage,
  ],
  imports: [
    IonicPageModule.forChild(DashboardPage),
    // Importing ChartsModule
    ChartsModule
  ],
})
export class DashboardPageModule {}
