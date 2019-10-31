import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, ToastController, AlertController, MenuController, Events, LoadingController  } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AuthData } from '../providers/auth-data';
import { Helpers } from '../providers/helpers';
import { FormsProvider } from '../providers/forms/forms';
import { DashboardProvider } from '../providers/dashboard/dashboard';
import { Globals } from '../services/globals.service';
import { AngularFireAuth } from 'angularfire2/auth';
import { APP_LANG } from './app.lang';
import { APP_CONFIG } from './app.config';
import { NetworkProvider } from '../providers/network';
import { Network } from '@ionic-native/network';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs/Observable';
import { storage } from 'firebase/app';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = 'LoginPage';

  pages: Array<{icon: any, title: string, component: any}>;
  appConfig: any = APP_CONFIG.Constants;
  menu: Array<any>
  appIsOnDevice: any;
  constructor(public platform: Platform,
    public globals: Globals,
    public statusBar: StatusBar, 
    public storage: Storage,
    public authDataModule: AuthData,
    public helpers: Helpers,
    public loadingCtrl: LoadingController,
    public FormsProvider: FormsProvider,
    public alertCtrl: AlertController,
    public afAuth: AngularFireAuth,
    private toastCtrl: ToastController,
    public menuCtrl: MenuController,
    public dashboard: DashboardProvider,
    public events: Events,
    public network: Network,
    public networkProvider: NetworkProvider,
    public splashScreen: SplashScreen) {
      let ion = this
        // DETECT DEVICE/BROWSER:
    ion.appIsOnDevice = !this.platform.url().startsWith('http');
    ion.initializeApp();
      
      //this.storage.set('changeForms', [])

    // used for an example of ngFor and navigation
    ion.pages = [
      { icon: 'user-icon', title: 'Home', component: 'HomePage' },
      { icon: 'dashboard-icon', title: 'Dashboard', component: 'DashboardPage' },
      { icon: 'user-icon', title: 'Profile', component: 'ProfilePage' }
    ];

    ion.menu = [
      
      {
        title: 'Layout with firebase',
        myicon: '',
        iconLeft: 'ios-filing',
        icon: 'ios-add-outline',
        showDetails: false,
        items: [

          { name: 'Authentication(Login)', component: 'LoginPage' },
          { name: 'Authentication(Register)', component: 'RegisterPage' },
          { name: 'Authentication(Forgot)', component: 'ForgotPage' },
          { name: 'Chart', component: 'ChartPage' },

          { name: 'City guide', component: 'Category1Page' },// app1 folder
          { name: 'Shopping', component: 'Category2Page' },// app2 folder
          { name: 'Restaurant', component: 'Category3Page' }, // app3 folder
          { name: 'Google map', component: 'MapPage' },
          { name: 'Image gallery', component: 'GalleryPage' },
          { name: 'Feed', component: 'FeedPage' },
          { name: 'Form', component: 'FormResultPage' },


          { name: 'Intro', component: 'IntroPage' },

          { name: 'Pinterest(Masonry)', component: 'MasonryPage' },
          { name: 'Profile2', component: 'Profile2Page' },
          { name: 'Profile3', component: 'Profile3Page' },
          { name: 'Profile4', component: 'Profile4Page' },
          { name: 'Radio player', component: 'RadioListPage' },

          { name: 'Search', component: 'SearchPage' },
          { name: 'Timeline', component: 'TimelinePage' }
        ]
      }, {
        title: 'Components',
        iconLeft: 'ios-copy',
        icon: 'ios-add-outline',
        showDetails: false,
        items: [
          { name: 'Accordion', component: 'AccordionPage' },

          { name: 'Action sheet', component: 'ActionsheetPage' },
          { name: 'Alert', component: 'AlertPage' },
          { name: 'Animation', component: 'AnimationsPage' },

          { name: 'Button', component: 'ButtonPage' },
          { name: 'Datetime', component: 'DatetimePage' },
          { name: 'Fab', component: 'FabPage' },
          { name: 'Fading header', component: 'FadingHeaderPage' },
          { name: 'Grid', component: 'GridPage' },
          { name: 'Header', component: 'HeaderPage' },
          { name: 'Input', component: 'InputPage' },
          { name: 'Item', component: 'ItemPage' },
          { name: 'Item sliding', component: 'ItemSlidingPage' },
          { name: 'Label', component: 'LabelPage' },
          { name: 'Radio button', component: 'RadioButtonPage' },
          { name: 'Rating', component: 'RatingPage' },

          { name: 'Range', component: 'RangePage' },
          { name: 'Search bar', component: 'SearchBarPage' },
          { name: 'Select option', component: 'SelectOptionPage' },
          { name: 'Segment', component: 'SegmentPage' },
          { name: 'Shrinking', component: 'ShrinkingPage' },

          { name: 'Tag', component: 'TagPage' },
          { name: 'Table', component: 'TablePage' },
          { name: 'Transparent header', component: 'TransparentHeaderPage' },
          { name: 'Toast', component: 'ToastPage' }

        ]
      }, {
        title: 'Theme',
        iconLeft: 'md-color-palette',
        icon: 'ios-add-outline',
        showDetails: false,
        items: [
          {
            name: 'Color',
            component: 'ThemePage'
          }
        ]
      }
    ];


  }

  initializeApp() {
    let langs = APP_LANG.Constants;

    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.splashScreen.show();
      this.statusBar.styleDefault();
      this.globals.LANG = langs.SPANISH;
      this.initNetworkMonitor()
      this.splashScreen.hide();
    });

    

  }

  
  changueLanguage() {
    let ion = this;
    let navLang = ion.helpers.checkNavigatorLanguage();
    let langs = APP_LANG.Constants;

    if (navLang == 'es' || navLang == 'es-ES') {
      ion.globals.LANG = langs.SPANISH;
    } else if (navLang == 'en' || navLang == 'en-EN') {
      ion.globals.LANG = langs.ENGLISH;
    } else if (navLang == 'fr' || navLang == 'fr-FR') {
      ion.globals.LANG = langs.FRENCH;
    } else {
      ion.globals.LANG = langs.ENGLISH;
    }
  }

  logout(){
    let ion = this;
        ion.authDataModule.logoutUser()
        .then( authData => {
          ion.afAuth.auth.signOut();
          console.log("Logged out");
          // toast message
          ion.presentToast('bottom', ion.globals.LANG.LOGGED_OUT);
          ion.menuCtrl.close();
          ion.nav.setRoot('LoginPage');
        }, error => {
          ion.presentAlert(error);
        });
  }

  toggleDetails(menu) {
    if (menu.showDetails) {
      menu.showDetails = false;
      menu.icon = 'ios-add-outline';
    } else {
      menu.showDetails = true;
      menu.icon = 'ios-remove-outline';
    }
  }
  openPage(page) {
    let ion = this;
    if (ion.authDataModule.isAuth()) {
      ion.nav.setRoot(page.component);
    } else {
      ion.nav.setRoot('LoginPage');
    }
  }
  
  presentToast(position: string,message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      position: position,
      duration: 3000
    });
    toast.present();
  }

  presentAlert(title) {
    let alert = this.alertCtrl.create({
      title: title,
      buttons: ['OK']
    });
    alert.present();
  }
  updateData()
  {
    //Save forms
  }
  saveAllAnswersOnConnect()
  {
    let loadingPopupHome = this.loadingCtrl.create({
      spinner: 'crescent', 
      content: ''
    });
    loadingPopupHome.present();
    Promise.all([this.storage.get('changeForms'), this.storage.get('allFormsQA')]).then(([changeForm, allForms]) =>{
      console.log(changeForm, allForms);
      for (let ii = 0; ii < changeForm.length; ii++) {
        const element = changeForm[ii].$key;
        console.log(allForms[element]);
        let idForm = allForms[element][0].Id_form
        console.log(idForm);
        
          this.FormsProvider.saveAllAnswers(allForms[element], changeForm[ii].id_entity, changeForm[ii].sync).then(res => {
            // console.log('va a guardar');
            // this.forms = null;
            this.FormsProvider.getFormUserByFormID(idForm).then(userForm => {
              let form: any;
              form = userForm;
              if (form.status == 1) {
                this.FormsProvider.updateFormStatus(idForm, 2).then(res => {
                  // console.log('updated form status.');
                  
                })
              } else {
                // console.log('form is already draft.');
                
              }
            })
          })
          
        }

        
      }).then(a =>{
        console.log('done!');
        //Update variables
        //Actualizar allFormsQA quitando los formularios sync
        let formUpdated = []
        Promise.all([this.storage.get('changeForms'), this.storage.get('allFormsQA')]).then(([changeForm, allForms])=>{
          formUpdated = [];
          changeForm = changeForm.filter(k => k.sync === true);
          
          allForms.forEach(element => {
            if (changeForm.find(k => k.id_form === element[0].Id_form) !== undefined) {
              console.log(formUpdated);
              
              formUpdated.push(element);
            }           
          });
          //debugger
        }).then(() =>{
          this.storage.set('allFormsQA', formUpdated);

        }).catch((e) =>{
          console.log(e);
        });
        this.storage.set('changeForms', []);
        loadingPopupHome.dismiss();
       
      }).catch((e)=>{
        console.log(e);
        
      })
  }
    // INIT NETWORK MONITOR:
    initNetworkMonitor() {
      console.log('network monitor');
      
      // check if we are on device or if its a browser
      if (this.platform.is('mobile') || this.platform.is('tablet')) {
        // watch network for a disconnect
        console.log('movil');
        
     
        let disconnectSubscription = this.network
          .onDisconnect()
          .subscribe(() => {
            console.log("network disconnected :(");
            // do alert here
            this.toastCtrl.create({
              message: 'Offline mode.',
              duration: 3000
            }).present();
          });

        // watch network for a connection
        let connectSubscription = this.network.onConnect().subscribe(() => {
          console.log("network connected!");
          // app got back online, do logic here
          this.toastCtrl.create({
            message: this.globals.LANG.CONNEC_TRIGGER,
            duration: 3000
          }).present();
          
          //Guardamos los formularios cambiados
          this.saveAllAnswersOnConnect()
          //Actualizamos los datos
          if (this.network.type === "wifi") {
            console.log("we got a wifi connection, woohoo!");
          }
        });

        //Only for test
        let browserOffline = Observable.fromEvent(window, "offline").subscribe(
          () => {
            console.log("Offline trigger");
            // go offline logic here
          }
        );
        let browserOnline = Observable.fromEvent(window, "online").subscribe(
          () => {
            // go back online
            console.log(this.globals.LANG.CONNEC_TRIGGER);
            this.saveAllAnswersOnConnect()
          }
        );
      } else {
        console.log("navegador");
        
        let browserOffline = Observable.fromEvent(window, "offline").subscribe(
          () => {
            console.log("Offline trigger");
            // go offline logic here
          }
        );
        let browserOnline = Observable.fromEvent(window, "online").subscribe(
          () => {
            // go back online
            console.log(this.globals.LANG.CONNEC_TRIGGER);
            this.saveAllAnswersOnConnect()
          }
        );
        
      }
    }
}
