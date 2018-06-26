import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

import { Platform } from 'ionic-angular';

//***********  Facebook **************/
import { Facebook } from '@ionic-native/facebook';

//***********  Google plus **************/
import { GooglePlus } from '@ionic-native/google-plus';

import { AngularFirestoreDocument } from 'angularfire2/firestore';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFirestoreCollection } from 'angularfire2/firestore';

import { Observable } from 'rxjs';
import { User } from '../models/user';

import { UserService } from '../services/user.service';

@Injectable()
export class AuthData {
  userscollection: AngularFirestoreCollection<User>;
  users: Observable<User[]>;
  userData: any;
  constructor(public afAuth: AngularFireAuth,
    private platform: Platform, private facebook: Facebook,
    private googleplus: GooglePlus,
    public afsModule: AngularFirestore,
    public userService: UserService) {
  }


  signInWithPopupFacebook(): Promise<any> {
    return this.afAuth.auth
      .signInWithPopup(new firebase.auth.FacebookAuthProvider())
      .then(res => console.log(res));
  }

  signInWithFacebook(): Promise<any> {

    return this.facebook.login(['email', 'public_profile']).then(res => {
      const facebookCredential = firebase.auth.FacebookAuthProvider.credential(res.authResponse.accessToken);
      return firebase.auth().signInWithCredential(facebookCredential);
    })


  }

  signInWithGoogle(): Promise<any> {

    return this.googleplus.login({
      // ***** Don't forgot to change webClientId ******//
      'webClientId': '134053776757-rj2vajjm340t2bilpencqq4hh1j76sv5.apps.googleusercontent.com',
      'offline': true
    }).then(res => {
      return firebase.auth().signInWithCredential(firebase.auth.GoogleAuthProvider.credential(res.idToken))
    })

  }

 updateUserProfile(uid,displayName,email,photo,phone){
  firebase.database().ref('/users').child(uid).once('value', function(snapshot) {
    var exists = (snapshot.val() !== null);
   
      if (exists) {
        firebase.database().ref('users/'+uid).update({ 
          name: displayName,
          email: email,
          photo: photo,
          phone: phone
        });

      } else {
        firebase.database().ref('/users').child(uid).set({  
          name: displayName,
          email: email,
          photo: photo,
          phone: phone
        });

      }
    });

  }

  loginUser(credentials): Promise<any> {
    return this.afAuth.auth.signInWithEmailAndPassword(credentials.email, credentials.password)
  }

  resetPassword(email: string): Promise<any> {
    return this.afAuth.auth.sendPasswordResetEmail(email);
  }

  logoutUser(): Promise<any> {
    return this.afAuth.auth.signOut();
  }


  registerUser(name: string, email: string, password: string, phone: number): Promise<any> {
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password).then((newUser) => {
      firebase.database().ref('/users').child(newUser.uid).set({
          email: email,
          name: name,
          phone: phone
      });
    });
  }

  setUserData(): Promise<any> {
    let ion = this;
    return new Promise((resolve, reject) => {
      try {
        ion.getUserProfile().then(userProfileData => {
          ion.userService.user = userProfileData;
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  // Obtein user Data for profile
  getUserProfile(): Promise<any> {
    let ion = this;
    return new Promise((resolve, reject) => {
      try {
        let authUser = ion.getAuthUser();
        ion.afsModule.collection('/users/').doc(authUser.uid).ref.get().then(function (Userdoc) {
          if (Userdoc.exists) {
            resolve(Userdoc.data());
          } else {
            console.error("No such document!, Error in register");
          };
        }).catch(function (error) {
          console.error("Error getting document:", error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  updateProfile(user) {
    let ion = this;
    return new Promise((resolve, reject) => {
      try {
        let authUser = ion.getAuthUser();
        ion.afsModule.collection('/users/').doc(authUser.uid).ref.update(user);
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }

  isAuth() {
    return firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        return true;
      } else {
        return false;
      }
    });
  }

  getAuthUser() {
    if (firebase.auth().currentUser) {
      let user = firebase.auth().currentUser;
      return user;
    } else {
      return null;
    }
  }

}

