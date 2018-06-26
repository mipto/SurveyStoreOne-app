import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { AuthData } from '../../../providers/auth-data';
import { FormBuilder, Validators } from '@angular/forms';
import { Globals } from '../../../services/globals.service';
import { UserService } from '../../../services/user.service';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage {

  public profileForm: any;
  onEdit: boolean;
  validEdit: boolean;
  constructor(public navCtrl: NavController,
    public fb: FormBuilder,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    public globals: Globals,
    public authData: AuthData,
    public userData: UserService) {

    let ion = this;
    ion.onEdit = false;

    ion.profileForm = fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2), Validators.pattern('[a-z A-Z]*')]],
      last_name: ['', [Validators.required, Validators.minLength(2), Validators.pattern('[a-z A-Z]*')]],
      phone: ['', [Validators.required, Validators.pattern('[0-9]*')]],
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
    if (!ion.profileForm.valid) {
      ion.presentToast("top", "no sirvio");
    }
    else {
      ion.authData.updateProfile(user)
        .then(function () {
          console.log('Saved successfully');
          ion.validEdit = false;
          ion.edit();
        }).catch(error => {
          console.log("Error updating data:", error);
        });
    }
  }

  public findInvalidControls() {
    let ion = this;
    let invalid = [];
    let controls = ion.profileForm.controls;
    for (let name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    ion.validEdit = invalid.length > 0 ? false : true;
    console.log(ion.validEdit);
    return ion.validEdit;
  }


  presentToast(position: string, message: string) {
    let ion = this;
    let toast = ion.toastCtrl.create({
      message: message,
      position: position,
      duration: 1000
    });
    toast.present();
  }

}
