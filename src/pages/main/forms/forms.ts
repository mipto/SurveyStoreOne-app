import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FormsProvider } from '../../../providers/forms/forms';


@IonicPage()
@Component({
  selector: 'page-forms',
  templateUrl: 'forms.html',
})
export class FormsPage {
  public forms: any;
  public idForm: any;
  public nameForm: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public FormsProvider: FormsProvider) {

    let data = navParams.get('data');
    this.idForm = data.idForm;
    this.nameForm = data.nameForm;
  }

  ionViewWillEnter(){
    this.FormsProvider.getAllDocuments(this.idForm).then(docs => {
      this.forms = docs;
      console.log('orderder forms', this.forms);
    })
  }
  ionViewWillLeave(){
    this.forms = null;
  }
  
}
