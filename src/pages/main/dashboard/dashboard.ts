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
    /*** Data ***/
    public entitiesVisited: number;
    public entitiesNoSinc: number;
    public totalEntities: number;
    public totalF: any;
    
    /*** Chart entities visited ***/
    public chartDataEnVis: number[] =  [];
    public chartLabelsEnVis: string[] = [this.globals.LANG.VISITED, this.globals.LANG.NO_VISITED];

    /*** Chart entities no synchronize ***/
    public chartDataEnNoSyn: number[] =  [];
    public chartLabelsEnNoSyn: string[] = [this.globals.LANG.SINCRONIZE, this.globals.LANG.NO_SINCRONIZE];

    /*** Chart formularies by fill ***/
    public chartDataForms: number[] =  [];
    public chartLabelsForms: string[] = [this.globals.LANG.BY_FILL, this.globals.LANG.BY_SAVE];

    /*** Chart formularies by synchronize ***/
    public chartDataFormSyn: number[] =  [];
    public chartLabelsFormSyn: string[] = [this.globals.LANG.SINCRONIZE, this.globals.LANG.NO_SINCRONIZE];
    
    /* Chart general */
    chartColor1: any[] = [{backgroundColor:['#3288bd','#5e4fa2', '#abdda4','#66c2a5']}]; 
    baseOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
    };
    isDataAvailable: boolean = false;  

    /*** Last connect ***/
    public lastConnect: any;

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
    let boolTE = false;
    let boolF = false;
    let boolNSE = false;
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
        
        this.entitiesVisited = this.getEntitiesVisited(AllEntities);
        this.totalEntities = AllEntities.length;
        /* Chart */
        this.chartDataEnVis = [this.entitiesVisited, this.totalEntities - this.entitiesVisited];
        /* this.chartDataEnVis.push(this.entitiesVisited);
        this.chartDataEnVis.push(this.totalEntities - this.entitiesVisited); */
        console.log(this.chartDataEnVis);
        console.log(this.chartLabelsEnVis);
        //loadingPopup
        boolTE = true;
        if(boolF && boolNSE && boolTE){
            this.isDataAvailable = true;
            loadingPopupHome.dismiss();
        } 

    }).catch((err) =>{
        console.log(err);
    });

    //TOTAL_FORMS_BY_FILL TOTAL_FORMS_BY_SINCRONIZE TOTAL_SAVED_FORMS
    ion.dashboardProvider.getTotalFormsByUser().then(AllForms => {
        this.totalF = this.getTotalForm(AllForms);
        
        /* Chart by fill */
        this.chartDataForms = [this.totalF.formByFill, this.totalF.formBySave];

        /* Chart synchronize */
        this.chartDataFormSyn = [AllForms.length - this.totalF.formBySinc, this.totalF.formBySinc];
        /* this.chartDataFormSyn.push(AllForms.length - this.totalF.formBySinc);
        this.chartDataFormSyn.push(this.totalF.formBySinc); */
        console.log(this.chartDataFormSyn);
        console.log(this.chartLabelsFormSyn);
        
        //loadingPopup
        boolF = true;
        if(boolF && boolNSE && boolTE){
            this.isDataAvailable = true;
            loadingPopupHome.dismiss();
        } 
    })

    //ESTABLISHMENT_BY_SINCRONIZE
    ion.dashboardProvider.getTotalNoSincEntities().then(AllEntitiesNoSyn => {

        this.entitiesNoSinc = AllEntitiesNoSyn.length;
        /* Chart */
        this.chartDataEnNoSyn = [this.totalEntities - this.entitiesNoSinc, this.entitiesNoSinc];
        /* this.chartDataEnNoSyn.push(this.totalEntities - this.entitiesNoSinc);
        this.chartDataEnNoSyn.push(this.entitiesNoSinc); */
        console.log(this.chartDataEnNoSyn);
        console.log(this.chartLabelsEnNoSyn);
        //loadingPopups
        boolNSE = true;
        if(boolF && boolNSE && boolTE){
            this.isDataAvailable = true;
            loadingPopupHome.dismiss();
        } 
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