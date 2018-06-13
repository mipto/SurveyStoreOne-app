import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController, AlertController ,ToastController} from 'ionic-angular';
import { AuthData } from '../../../providers/auth-data';

import { AngularFireDatabase, FirebaseObjectObservable} from 'angularfire2/database-deprecated';
import { AngularFireAuth } from 'angularfire2/auth';

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
    afAuthSubscription:any;
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
    this.AuthSubscription = this.afAuth.authState.subscribe(userAuth => {
     
        if(userAuth) {
          console.log("auth true!")
          this.uid = userAuth.uid;     
          this.email = userAuth.email;
          this.profilePicture = "https://www.gravatar.com/avatar/" + md5(this.email.toLowerCase(), 'hex');

          let loadingPopup = this.loadingCtrl.create({
            spinner: 'crescent', 
            content: '',
            duration: 15000
          });
          loadingPopup.present();

          this.profile = this.afDb.object('/userProfile/'+this.uid );
          this.ProfileSubscription = this.profile.subscribe(profile => {
              this.profileArray = profile;
              loadingPopup.dismiss();
          })

        } else {
          console.log("auth false");
          this.navCtrl.setRoot('LoginPage');
        }

      });
  }

  logout(){
        this.authData.logoutUser()
        .then( authData => {
          this.AuthSubscription.unsubscribe();
          this.ProfileSubscription.unsubscribe();
          this.afAuth.auth.signOut();
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
