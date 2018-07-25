import { NgModule } from '@angular/core';
import { MapToEntityPage } from './mapToEntity';
import { IonicPageModule } from 'ionic-angular';

@NgModule({
  declarations: [
    MapToEntityPage,
  ],
  imports: [
    IonicPageModule.forChild(MapToEntityPage),
  ],
  exports: [
    MapToEntityPage
  ]
})
export class MapToEntityPageModule {}
