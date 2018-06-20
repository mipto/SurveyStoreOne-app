import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database-deprecated';
import { User } from "../../../models/user";
import { AuthData } from '../../../providers/auth-data';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage {

  user = {} as User;
  onEdit: boolean;
  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public loadingCtrl: LoadingController, 
    private toastCtrl: ToastController, 
    public authData: AuthData) {
    let ion = this;
    ion.onEdit = false;
  }

  ionViewWillEnter(){
    let ion = this;
    ion.authData.getUserProfile().then(userProfileData => {
      ion.user = userProfileData;
      console.log("this is profile", ion.user);
    });
   }

  edit() {
    let ion = this;
    if (ion.onEdit == false) {
      ion.onEdit = true;
    } else {
      ion.onEdit = false;
    }
  }

  save(user) {
    let ion = this;
    console.log(user);
    ion.authData.updateProfile(user)
    .then(function() {
        console.log('Saved successfully');
        ion.edit();
    }).catch(error => {
      console.log("Error updating data:", error);
  });
  }


  presentToast(position: string, message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      position: position,
      duration: 1000
    });
    toast.present();
  }

}
