import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController, AlertController , ToastController} from 'ionic-angular';
import { AuthData } from '../../../providers/auth-data';

import { AngularFireDatabase, FirebaseObjectObservable} from 'angularfire2/database-deprecated';
import { AngularFireAuth } from 'angularfire2/auth';

import { APP_CONFIG } from "./../../../app/app.config";

import md5 from 'crypto-md5'; // dependencies:"crypto-md5"
import { Subscription } from 'rxjs/Subscription';

@IonicPage()
@Component({
  selector: 'page-dashboard',
  templateUrl: 'dashboard.html'
})
export class DashboardPage {

    email: any;
    profilePicture: any = "https://www.gravatar.com/avatar/"
    profileArray : any=[]; 
    profile: FirebaseObjectObservable<any[]>;
    uid:any;
    AuthSubscription: Subscription;
    ProfileSubscription: Subscription;

  constructor(public navCtrl: NavController, 
    public authData: AuthData,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    public afAuth: AngularFireAuth, 
    public afDb: AngularFireDatabase) {
    
  }

  ionViewWillLoad(){
    let ion = this;
    let app_name = APP_CONFIG.Constants.APP_NAME;

    ion.AuthSubscription = ion.afAuth.authState.subscribe(userAuth => {
        if(userAuth) {
          console.log("auth true! dashboard")
          ion.toastCtrl.create({
            message: 'Welcome to '+ app_name +'!, '+ userAuth.email,
            duration: 3000
          }).present();
          ion.uid = userAuth.uid;     
          ion.email = userAuth.email;
          ion.profilePicture = "https://www.gravatar.com/avatar/" + md5(ion.email.toLowerCase(), 'hex');

          let loadingPopup = ion.loadingCtrl.create({
            spinner: 'crescent', 
            content: '',
            duration: 15000
          });
          loadingPopup.present();

          ion.profile = ion.afDb.object('/userProfile/'+ion.uid );
          ion.ProfileSubscription = ion.profile.subscribe(profile => {
            ion.profileArray = profile;
              loadingPopup.dismiss();
          })

        } else {
          ion.AuthSubscription.unsubscribe();
          console.log("auth false dashboard, moving login");
          ion.navCtrl.setRoot('LoginPage');
        }

      });
  }

  logout(){
        this.authData.logoutUser()
        .then( authData => {
          this.afAuth.auth.signOut();
          this.AuthSubscription.unsubscribe();
          this.ProfileSubscription.unsubscribe();
          console.log("Logged out");
          // toast message
          this.presentToast('bottom','You are now logged out');
          this.navCtrl.setRoot('LoginPage');
        }, error => {
          var errorMessage: string = error.message;
          console.log(errorMessage);
          //this.presentAlert(errorMessage);
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
