import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController , ToastController} from 'ionic-angular';
import { AuthData } from '../../../providers/auth-data';
import { CardsProvider } from '../../../providers/forms/cards-list';
import { Globals } from '../../../services/globals.service';

import { AngularFireDatabase} from 'angularfire2/database-deprecated';
import { AngularFireAuth } from 'angularfire2/auth';

import { UserService } from '../../../services/user.service';

//Geolocation
import { Geolocation } from '@ionic-native/geolocation';

@IonicPage()
@Component({
  selector: 'page-mapToEntity',
  templateUrl: 'mapToEntity.html'
})
export class MapToEntityPage {

  public search: object = {
    client: '',
    entity: ''
  };
  public forms: any;

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
    public cardsList: CardsProvider,
    private geolocation: Geolocation) {
    
      this.search = navParams.get('data');
  }

  ionViewWillEnter(){
    let ion = this;
   console.log('new view', this.search);
   ion.cardsList.getAllFormsByClientAndEntitie(this.search).then(AllForms => {
    ion.forms = AllForms;

    console.log('new view forms', ion.forms);
    
  });

  //Test GeoLocation

  this.geolocation.getCurrentPosition().then((resp) => {
    // resp.coords.latitude
    // resp.coords.longitude
    console.log(resp.coords);
    
   }).catch((error) => {
     console.log('Error getting location', error);
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