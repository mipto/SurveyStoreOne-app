import { NgModule } from '@angular/core';
import { CardsPage } from './cards';
import { IonicPageModule } from 'ionic-angular';

@NgModule({
  declarations: [
    CardsPage,
  ],
  imports: [
    IonicPageModule.forChild(CardsPage),
  ],
  exports: [
    CardsPage
  ]
})
export class CardsPageModule {}
