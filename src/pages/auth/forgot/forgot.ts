import { IonicPage, NavController,LoadingController, AlertController } from 'ionic-angular';
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthData } from '../../../providers/auth-data';
import { Globals } from '../../../services/globals.service';
import { APP_CONFIG } from '../../../app/app.config';


@IonicPage()
@Component({
  selector: 'page-forgot',
  templateUrl: 'forgot.html'
})
export class ForgotPage {
  public resetPasswordForm;
  public backgroundImage: any = "./assets/bg3.jpg"; 
  appConfig: any = APP_CONFIG.Constants;

  constructor(public authData: AuthData, public fb: FormBuilder, 
    public nav: NavController, 
    public loadingCtrl: LoadingController, 
    public alertCtrl: AlertController,
    public globals: Globals) {

      let EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
      this.resetPasswordForm = fb.group({
            email: ['', Validators.compose([Validators.required, Validators.pattern(EMAIL_REGEXP)])],
      });
  }

  resetPassword(){
    if (!this.resetPasswordForm.valid){
        console.log("form is invalid = "+ this.resetPasswordForm.value);
    } else {

      let loadingPopup = this.loadingCtrl.create({
        spinner: 'crescent', 
        content: ''
      });
      loadingPopup.present();
      this.authData.resetPassword(this.resetPasswordForm.value.email)
      .then((user) => {
          loadingPopup.dismiss();
          this.presentAlert("We just sent you a reset link to your email");
          this.nav.setRoot('LoginPage');
      }, (error) => {
          loadingPopup.dismiss();
          var errorMessage: string = error.message;
          this.presentAlert(errorMessage);
      });
    }
  }

  presentAlert(title) {
    let alert = this.alertCtrl.create({
      title: title,
      buttons: ['OK']
    });
    alert.present();
  }
}
