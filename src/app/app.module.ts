import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

//************** ionic ******************/
import { IonicStorageModule } from '@ionic/storage';

//*********** ionic Native **************/
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Geolocation } from '@ionic-native/geolocation';

import { MyApp } from './app.component';

//***********  Angularfire2 v5 **************/
import { AngularFireModule } from 'angularfire2';
// New imports to update based on AngularFire2 version 4
import { AngularFireDatabaseModule } from 'angularfire2/database-deprecated';
//import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireAuthModule } from 'angularfire2/auth';
//Firestore Imports
import { AngularFirestoreModule } from 'angularfire2/firestore';
// Firebase Config
import { FIREBASE_CONFIG } from "./app.firebase.config";

import { Facebook } from '@ionic-native/facebook';
import { GooglePlus } from '@ionic-native/google-plus';

//*********** Provider **************/
import { AuthData } from '../providers/auth-data';
import { Helpers } from '../providers/helpers';
import { RadioPlayer } from '../providers/radio-service';

//*********** Services ****************/
import { UserService } from '../services/user.service';
import { Globals } from '../services/globals.service';

//************** import image gallery *********************//
import * as ionicGalleryModal from 'ionic-gallery-modal';
import { HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { FormsProvider } from '../providers/forms/forms';
import { PhotosProvider } from '../providers/forms/photos';
import { CardsProvider } from '../providers/forms/cards-list';

/*HTTP CLIENT */
import { HttpClientModule } from '@angular/common/http';
import { DashboardProvider } from '../providers/dashboard/dashboard';

@NgModule({
  declarations: [
    MyApp,
  ],
  imports: [
    BrowserModule,
    ionicGalleryModal.GalleryModalModule,
    IonicModule.forRoot(MyApp),
    HttpClientModule,
    AngularFireModule.initializeApp(FIREBASE_CONFIG),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    AngularFirestoreModule,
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Geolocation,
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: ionicGalleryModal.GalleryModalHammerConfig,
    },
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    Globals,
    AuthData,
    UserService,
    Helpers,
    Facebook,
    RadioPlayer,
    Facebook,
    GooglePlus,
    FormsProvider,
    CardsProvider,
    DashboardProvider,
    PhotosProvider
  ]
})
export class AppModule {}
