import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController, AlertController , ToastController} from 'ionic-angular';
import { AuthData } from '../../../providers/auth-data';
import { CardsProvider } from '../../../providers/forms/cards-list';
import { Globals } from '../../../services/globals.service';

import { AngularFireDatabase} from 'angularfire2/database-deprecated';
import { AngularFireAuth } from 'angularfire2/auth';

import { UserService } from '../../../services/user.service';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  public search: object = {
    client: '',
    entity: ''
  };

  public clients: any;
  public entities: any;

  constructor(public navCtrl: NavController, 
    public authData: AuthData,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    public afAuth: AngularFireAuth, 
    public afDb: AngularFireDatabase,
    public globals: Globals,
    public userData: UserService,
    public cardsList: CardsProvider) {
    
  }

  ionViewWillEnter(){
    let ion = this;
    ion.cardsList.getAllClients().then(Allclients => {
      ion.clients = Allclients;
    });
    
  }

  onClientSelectChange(selectedValue: any) {
    let ion = this;
    ion.cardsList.getAllEntitiesByUser(selectedValue).then(AllEntities => {
      ion.entities = AllEntities;
    });
  }

  searchForm() {
    let ion = this;
    console.log(this.search);
    
    ion.navCtrl.push('CardsPage', {
      data: this.search
    });
  }

  logout(){
    let ion = this;
        ion.authData.logoutUser()
        .then( authData => {
          ion.afAuth.auth.signOut();
          console.log("Logged out");
          // toast message
          ion.presentToast('bottom', ion.globals.LANG.LOGGED_OUT);
          ion.navCtrl.setRoot('LoginPage');
        }, error => {
          ion.presentAlert(error);
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