import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database-deprecated';
import { User } from "../../../models/user";
import { AuthData } from '../../../providers/auth-data';
import { audit } from 'rxjs/operators';
import { FormBuilder, Validators } from '@angular/forms';
import { Globals } from '../../../providers/globals';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage {

  public profileForm: any;
  user = {} as User;
  onEdit: boolean;
  validEdit: boolean;
  constructor(public navCtrl: NavController,
    public fb: FormBuilder,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    public globals: Globals,
    public authData: AuthData) {

    let ion = this;
    ion.onEdit = false;

    ion.profileForm = fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2), Validators.pattern('[a-z A-Z]*')]],
      last_name: ['', [Validators.required, Validators.minLength(2), Validators.pattern('[a-z A-Z]*')]],
      phone: ['', [Validators.required, Validators.pattern('[0-9]*')]],
    });

  }

  ionViewWillEnter() {
    let ion = this;
    ion.authData.getUserProfile().then(userProfileData => {
      ion.user = userProfileData;
      ion.user.email = ion.authData.getAuthUser().email;
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
    if (!ion.profileForm.valid) {
      ion.presentToast("top", "no sirvio");
      console.log("error");
    }
    else {
      ion.authData.updateProfile(user)
        .then(function () {
          console.log('Saved successfully');
          ion.edit();
        }).catch(error => {
          console.log("Error updating data:", error);
        });
    }
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.profileForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    this.validEdit = invalid.length > 0 ? false : true;
    console.log(this.validEdit);
    return this.validEdit;
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
