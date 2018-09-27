import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController , ToastController} from 'ionic-angular';
import { AuthData } from '../../../providers/auth-data';
import { CardsProvider } from '../../../providers/forms/cards-list';
import { Globals } from '../../../services/globals.service';

import { AngularFireDatabase} from 'angularfire2/database-deprecated';
import { AngularFireAuth } from 'angularfire2/auth';

import { UserService } from '../../../services/user.service';

@IonicPage()
@Component({
  selector: 'page-searchEntity',
  templateUrl: 'searchEntity.html'
})
export class SearchEntityPage {

  public entities: any;
  public selectedEntity: any;
  public selectedClient: any;

  constructor(public navCtrl: NavController, 
    public authData: AuthData,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    public afAuth: AngularFireAuth, 
    public afDb: AngularFireDatabase,
    public globals: Globals,
    public userData: UserService,
    public navParams: NavParams,
    public cardsList: CardsProvider) {

      this.initializeItems();
  }

  initializeItems() {
    let ion = this;
    let data = ion.navParams.get('data');
    
    ion.entities = data.entities;
    ion.selectedClient = data.selectedClient;
  }

  getEntities(ev: any) {
    // Reset items back to all of the items
    this.initializeItems();

    // set val to the value of the searchbar
    const val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.entities = this.entities.filter((entitie) => {
        return (entitie.Name.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }

  goFormWithEntity() {
    let ion = this;

    ion.navCtrl.setRoot('HomePage', {
      data: {
        selectedEntity: ion.selectedEntity,
        selectedClient: ion.selectedClient
      }
    });
  }


  presentAlert(title) {
    let alert = this.alertCtrl.create({
      title: title,
      buttons: ['OK']
    });
    alert.present();
  }

  presentToast(position: string,message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      position: position,
      duration: 3000
    });
    toast.present();
  }

}