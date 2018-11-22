import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, ToastController, AlertController, MenuController  } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AuthData } from '../providers/auth-data';
import { Helpers } from '../providers/helpers';
import { DashboardProvider } from '../providers/dashboard/dashboard';
import { Globals } from '../services/globals.service';
import { AngularFireAuth } from 'angularfire2/auth';
import { APP_LANG } from './app.lang';
import { APP_CONFIG } from './app.config';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  @ViewChild(Nav) nav: Nav;
  rootPage: string = 'LoginPage';
  menu: Array<any> = [];
  pages: Array<any>;
  appConfig: any = APP_CONFIG.Constants;

  constructor(public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public authDataModule: AuthData,
    public helpers: Helpers,
    public alertCtrl: AlertController,
    public afAuth: AngularFireAuth,
    private toastCtrl: ToastController,
    public menuCtrl: MenuController,
    public globals: Globals,
    public storage: Storage,
    public dashboard: DashboardProvider) {
    let ion = this;
    
    ion.initializeApp();

    
    ion.pages = [
      { icon: 'user-icon', title: 'Home', component: 'HomePage' },
      { icon: 'dashboard-icon', title: 'Dashboard', component: 'DashboardPage' },
      { icon: 'user-icon', title: 'Profile', component: 'ProfilePage' },
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
    let ion = this;
    var db: any;

    //ion.splashScreen.show();

    ion.platform.ready().then(() => {
      ion.statusBar.styleDefault();
      ion.splashScreen.hide();
      ion.changueLanguage();
    });
    
    ion.platform.resume.subscribe((result)=>{
      
      console.log('Platform Resume Event');
      var actualDate = new Date();
      var dd = actualDate.getDate();
      var mm = actualDate.getMonth()+1; 
      var date = [(dd>9 ? '' : '0') + dd, '/',
        (mm>9 ? '' : '0') + mm, '/',
        actualDate.getFullYear()
      ].join('');

      console.log(date);

      ion.authDataModule.getLastConnection().then(lastC => {
          //console.log(lastC);
          //Save the last connection
          if(!lastC)
          {
            this.storage.set('last_connection', date);
          }else{
            this.storage.set('last_connection', lastC);
          }
          //Update new last_connection
          ion.authDataModule.updateLastConnection(date);
      }).catch((e) =>{
          console.log(e);
      });  
      
      

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

}
