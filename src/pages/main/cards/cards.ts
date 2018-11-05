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
  selector: 'page-cards',
  templateUrl: 'cards.html'
})
export class CardsPage {

  public search: object = {
    client: '',
    entity: ''
  };
  public entityName: any;
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
    
      let data = navParams.get('data');

      this.search = data.search;
      this.entityName = data.entityName;

  }

  ionViewWillEnter(){
    let ion = this;
   console.log('new view', this.search);
   ion.cardsList.getAllFormsByUserClientAndEntity(this.search).then(AllForms => {
    console.log('new view forms', AllForms);
      ion.forms = AllForms;
      console.log('resolved view', AllForms);
      
  }).catch(err => {
    ion.toastCtrl.create({
      message: 'This entity doesnt have any form, please select another.',
      duration: 3000
    }).present();
  });

  // //Test GeoLocation
  // this.geolocation.getCurrentPosition().then((resp) => {
  //   // resp.coords.latitude
  //   // resp.coords.longitude
  //   console.log(resp.coords);
    
  //  }).catch((error) => {
  //    console.log('Error getting location', error);
  //  });
    
  }

  goForm(idForm, nameForm) {
    let ion = this;
    
    ion.navCtrl.push('FormsPage', {
      data: {
        idForm: idForm,
        nameForm: nameForm
      }
    });
  }

  getFormStatusColor(status) {
    if (status == 1) {
      return 'secondary';
    } else if (status == 2){
      return 'ios-orange';
    } else {
      return 'ios-green';
    }
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