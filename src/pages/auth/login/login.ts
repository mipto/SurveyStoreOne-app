import { Component } from '@angular/core';
import {  IonicPage, NavController, LoadingController, AlertController, ToastController } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Facebook } from '@ionic-native/facebook';
import { GooglePlus } from '@ionic-native/google-plus';

import { Subscription } from 'rxjs/Subscription';

import { AuthData } from '../../../providers/auth-data';
import { DashboardProvider } from '../../../providers/dashboard/dashboard';
import { UserService } from '../../../services/user.service';
import { Globals } from '../../../services/globals.service';
import { APP_CONFIG } from '../../../app/app.config';

import { AngularFireDatabase, FirebaseObjectObservable} from 'angularfire2/database-deprecated';
import { AngularFireAuth } from 'angularfire2/auth';



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
  appConfig: any = APP_CONFIG.Constants;

  constructor(public navCtrl: NavController, public authData: AuthData, public fb: FormBuilder, 
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private facebook: Facebook,
    private googleplus: GooglePlus,
    private platform: Platform,
    public afAuth: AngularFireAuth, 
    public afDb: AngularFireDatabase,
    private toast: ToastController,
    public globals: Globals,
    public UserService: UserService,
    public storage: Storage,
    public dashboard: DashboardProvider) {
      let ion = this;
      let EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
      ion.loginForm = fb.group({
            email: ['', Validators.compose([Validators.required, Validators.pattern(EMAIL_REGEXP)])],
            password: ['', Validators.compose([Validators.minLength(6), Validators.required])]
      });
  }

  ionViewWillEnter(){
    let ion = this;
       ion.AuthSubscription = ion.afAuth.authState.subscribe(userAuth => {
        if (userAuth && userAuth.email && userAuth.uid) {
          console.log('auth true login, moving dashboard');
          ion.authData.setUserData().then( () => {
            ion.AuthSubscription.unsubscribe();
          ion.navCtrl.setRoot('HomePage');
          ion.toast.create({
            message: ion.globals.LANG.WELCOME_TO + ' ' + ion.appConfig.APP_NAME +'!, '+ userAuth.email,
                        duration: 3000
            }).present();
          });
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

          //LAST_CONNECTION
          var actualDate = new Date();
          var dd = actualDate.getDate();
          var mm = actualDate.getMonth()+1; 
          var date = [(dd>9 ? '' : '0') + dd, '/',
            (mm>9 ? '' : '0') + mm, '/',
            actualDate.getFullYear()
          ].join('');

          ion.authData.getLastConnection().then(lastC => {
              console.log(lastC);
              //Save the last connection
              if(!lastC)
              {
                //console.log("no existe el campo");
                this.storage.set('last_connection', date);
              }else{
                //console.log("existe el campo");
                this.storage.set('last_connection', lastC);
              }
              //Update new last_connection
              ion.authData.updateLastConnection(date);

          }).catch((e) =>{
              console.log(e);
          });  
          
          
          //END LAST_CONNECTION

          ion.authData.setUserData().then( () => {
            loadingPopupLogin.dismiss();
            
            ion.navCtrl.setRoot('HomePage');
            ion.toast.create({
              message: ion.globals.LANG.WELCOME_TO + ' ' + ion.appConfig.APP_NAME +'!, '+ authData.email,
                          duration: 3000
              }).present();
          });
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
