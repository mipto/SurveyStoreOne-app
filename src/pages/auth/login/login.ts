import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController, AlertController, ToastController } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { Platform } from 'ionic-angular';
import { Facebook } from '@ionic-native/facebook';
import { GooglePlus } from '@ionic-native/google-plus';

// Authenticated User Data
import { AuthData } from '../../../providers/auth-data';

import { Globals } from '../../../providers/globals';

import { AngularFireDatabase, FirebaseObjectObservable} from 'angularfire2/database-deprecated';
import { AngularFireAuth } from 'angularfire2/auth';

import { APP_CONFIG } from "./../../../app/app.config";
import { Subscription } from 'rxjs/Subscription';

//Auth Pages

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  public loginForm: any;
  public backgroundImage: any = "./assets/bg1.jpg";
  public AuthSubscription: Subscription;
  appIcon: string;

  constructor(public navCtrl: NavController, public authData: AuthData, public fb: FormBuilder, 
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private facebook: Facebook,
    private googleplus: GooglePlus,
    private platform: Platform,
    public afAuth: AngularFireAuth, 
    public afDb: AngularFireDatabase,
    private toast: ToastController,
    public globals: Globals) {
      let ion = this;
      let EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
      ion.loginForm = fb.group({
            email: ['', Validators.compose([Validators.required, Validators.pattern(EMAIL_REGEXP)])],
            password: ['', Validators.compose([Validators.minLength(6), Validators.required])]
      });

      ion.appIcon = APP_CONFIG.Constants.APP_ICON;
  }

  ionViewWillEnter(){
    let ion = this;
       ion.AuthSubscription = ion.afAuth.authState.subscribe(userAuth => {
        if (userAuth && userAuth.email && userAuth.uid) {
          console.log('auth true login, moving dashboard');
          ion.AuthSubscription.unsubscribe();
          ion.navCtrl.setRoot('DashboardPage');
        } else {
          ion.AuthSubscription.unsubscribe();
          console.log("auth false, continue login!")
       }
        });
}

  login(){
    let ion = this;

    let LoginCredentials = ion.loginForm.value;

    let loadingPopupLogin = ion.loadingCtrl.create({
      spinner: 'crescent', 
      content: ''
    });

      if (!ion.loginForm.valid){
          ion.presentAlert('Username password can not be blank')
          console.log("error");
      } else {
        loadingPopupLogin.present();
        ion.authData.loginUser(LoginCredentials)
        .then( authData => {
          console.log("Auth pass", authData);
          loadingPopupLogin.dismiss();
          ion.navCtrl.setRoot('DashboardPage');
        }, error => {
          var errorMessage: string = error.message;
          loadingPopupLogin.dismiss().then( () => {
            ion.presentAlert(errorMessage)
          });
        });
      }
  }

  forgot(){
    let ion = this;
    ion.navCtrl.push('ForgotPage');
  }

  createAccount(){
    let ion = this;
    ion.navCtrl.push('RegisterPage');
  }
  presentAlert(title) {
    let ion = this;
    let alert = ion.alertCtrl.create({
      title: title,
      buttons: ['OK']
    });
    alert.present();
  }

}
