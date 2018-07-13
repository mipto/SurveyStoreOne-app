import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FormsProvider } from '../../providers/forms/forms';


@IonicPage()
@Component({
  selector: 'page-forms',
  templateUrl: 'forms.html',
})
export class FormsPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, public FormsProvider: FormsProvider) {
  }

  ionViewDidLoad() {
    //this.FormsProvider.getAllDocuments;
  }

  ionViewWillEnter(){
    console.log(this.FormsProvider.getAllDocuments());
}
  

  

}
