import { NgModule } from '@angular/core';
import { SearchEntityPage } from './searchEntity';
import { IonicPageModule } from 'ionic-angular';

@NgModule({
  declarations: [
    SearchEntityPage,
  ],
  imports: [
    IonicPageModule.forChild(SearchEntityPage),
  ],
  exports: [
    SearchEntityPage
  ]
})
export class SearchEntityPageModule {}
