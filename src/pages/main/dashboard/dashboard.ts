import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController , ToastController} from 'ionic-angular';
import { AuthData } from '../../../providers/auth-data';
import { Globals } from '../../../services/globals.service';
import { CardsProvider } from '../../../providers/forms/cards-list';
import { DashboardProvider } from '../../../providers/dashboard/dashboard';
import { Storage } from '@ionic/storage';

import { AngularFireDatabase} from 'angularfire2/database-deprecated';
import { AngularFireAuth } from 'angularfire2/auth';

import { UserService } from '../../../services/user.service';

@IonicPage()
@Component({
  selector: 'page-dashboard',
  templateUrl: 'dashboard.html'
})
export class DashboardPage {
    public entitiesVisited: number;
    public entitiesNoSinc: number;
    public entitiesVisitedPercent: number;
    public entitiesNoSincPercent: number;
    public totalEntities: number;
    public totalF: any;
    public lastConnect: any;
    public entitiesVisitedPercentColor = "ios-orange";
    public entitiesNoSincPercentColor = "ios-orange";

    constructor(public navCtrl: NavController, 
        public authData: AuthData,
        public alertCtrl: AlertController,
        public loadingCtrl: LoadingController,
        private toastCtrl: ToastController,
        public afAuth: AngularFireAuth, 
        public afDb: AngularFireDatabase,
        public globals: Globals,
        public userData: UserService,
        public navParams: NavParams,
        public cardsProvider: CardsProvider,
        public dashboardProvider : DashboardProvider,
        public storage: Storage) {
            this.entitiesVisited = 0;
            this.entitiesNoSinc = 0;
            this.totalF = {
                formByFill: 0,
                formBySinc: 0,
                formBySave: 0,
            };
            storage.get('last_connection').then((last_con) => {
                //console.log('ultima conexion: ', last_con);
                this.lastConnect =  last_con;
            }).catch((er) =>{
                console.log(er);
            });
            
    }

  ionViewWillEnter(){
    let ion = this;
    let loadingPopupHome = ion.loadingCtrl.create({
      spinner: 'crescent', 
      content: ''
    });
    if (this.navParams.get('data')) {
    let data = this.navParams.get('data');
        console.log(data);
    }

    loadingPopupHome.present();

    //VISITED_ESTABLISHMENT
    ion.dashboardProvider.getTotalEntitiesByUser().then(AllEntities => {
        
        this.totalEntities = AllEntities.length;
        this.entitiesVisited = this.getEntitiesVisited(AllEntities);
        this.entitiesVisitedPercent = this.entitiesVisited * 100 / this.totalEntities;
        //Set color to text
        if(this.entitiesVisitedPercent == 100) this.entitiesVisitedPercentColor = "secondary";
        else if(this.entitiesVisitedPercent <= 50) this.entitiesVisitedPercentColor = "danger";
    }).catch((err) =>{
        console.log(err);
    });

    //TOTAL_FORMS_BY_FILL TOTAL_FORMS_BY_SINCRONIZE TOTAL_SAVED_FORMS
    ion.dashboardProvider.getTotalFormsByUser().then(AllForms => {
        this.totalF = this.getTotalForm(AllForms);

    })

    //ESTABLISHMENT_BY_SINCRONIZE
    ion.dashboardProvider.getTotalNoSincEntities().then(AllEntities => {

        this.entitiesNoSinc = AllEntities.length;
        this.entitiesNoSincPercent = this.entitiesNoSinc * 100 / this.totalEntities;
        //Set color to text
        if(this.entitiesNoSincPercent == 0) this.entitiesNoSincPercentColor = "secondary";
        else if(this.entitiesNoSincPercent >= 50) this.entitiesNoSincPercentColor = "danger";

        loadingPopupHome.dismiss();

    }).catch((err) =>{
        console.log(err);
    });
    
  }
    getTotalForm(AllForms) 
    {
        let totalForm ={
            formByFill: 0,
            formBySinc: 0,
            formBySave: 0,
        }

        AllForms.forEach( function(ii) {
               
            switch (ii.status) {
                case 1:
                    totalForm.formByFill++;     
                    totalForm.formBySinc++;     

                break;
                case 2:
                    totalForm.formBySinc++;     
                    totalForm.formBySave++;     
                break;
                default:
                break;
            }
        })

    return totalForm;
  }
  
  getEntitiesVisited(AllEntities) : number
  {
    let cont = 0;
    AllEntities.forEach(function (ii) {
        if(ii.status === "1") {
            cont++;
        }
    })
    return cont;
  }

  logout(){
    let ion = this;
        ion.authData.logoutUser()
        .then( authData => {
          ion.afAuth.auth.signOut();
          console.log("Logged out");
          // toast message
          ion.presentToast('bottom', ion.globals.LANG.LOGGED_OUT);
          ion.navCtrl.setRoot('LoginPage');
        }, error => {
          ion.presentAlert(error);
        });
  }

  presentAlert(title) {
    let alert = this.alertCtrl.create({
      title: title,
      buttons: ['OK']
    });
    alert.present();
  }

  presentToast(position: string,message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      position: position,
      duration: 3000
    });
    toast.present();
  }

}