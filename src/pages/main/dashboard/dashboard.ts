import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController, AlertController , ToastController} from 'ionic-angular';
import { AuthData } from '../../../providers/auth-data';
import { Globals } from '../../../providers/globals';

import { AngularFireDatabase} from 'angularfire2/database-deprecated';
import { AngularFireAuth } from 'angularfire2/auth';

import { APP_CONFIG } from "./../../../app/app.config";

import { Subscription } from 'rxjs/Subscription';

import { User } from "../../../models/user";

@IonicPage()
@Component({
  selector: 'page-dashboard',
  templateUrl: 'dashboard.html'
})
export class DashboardPage {
    user = {} as User;
    AuthSubscription: Subscription;

  constructor(public navCtrl: NavController, 
    public authData: AuthData,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    public afAuth: AngularFireAuth, 
    public afDb: AngularFireDatabase,
    public globals: Globals) {
    
  }

  ionViewWillLoad(){
    let ion = this;
    let app_name = APP_CONFIG.Constants.APP_NAME;

    let viewDataLaoding = ion.loadingCtrl.create({
      spinner: 'crescent', 
      content: '',
      duration: 15000
    });

    viewDataLaoding.present().then( () => {
      ion.AuthSubscription = ion.afAuth.authState.subscribe(userAuth => {
        if(userAuth) {
          console.log("auth true! dashboard")
          
          ion.authData.getUserProfile().then(userProfileData => {
            console.log(userProfileData);
            
            ion.user = userProfileData;

            //Dismiss loading Ctrl
            viewDataLaoding.dismiss();
            //Show bottom badge
            ion.toastCtrl.create({
              message: ion.globals.LANG.WELCOME_TO + ' ' + app_name +'!, '+ userAuth.email,
              duration: 3000
            }).present();
          });

        } else {
          ion.AuthSubscription.unsubscribe();
          console.log("auth false dashboard, moving login");
          ion.navCtrl.setRoot('LoginPage');
        }

      });
    });
  }

  logout(){
    let ion = this;
        ion.authData.logoutUser()
        .then( authData => {
          ion.AuthSubscription.unsubscribe();
          ion.afAuth.auth.signOut();
          console.log("Logged out");
          // toast message
          ion.presentToast('bottom', ion.globals.LANG.LOGGED_OUT);
          ion.navCtrl.setRoot('LoginPage');
        }, error => {
          var errorMessage: string = error.message;
          console.log(errorMessage);
          //ion.presentAlert(errorMessage);
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
