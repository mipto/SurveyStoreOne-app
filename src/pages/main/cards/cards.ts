import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController , ToastController} from 'ionic-angular';
import { AuthData } from '../../../providers/auth-data';
import { CardsProvider } from '../../../providers/forms/cards-list';
import { Globals } from '../../../services/globals.service';
import { Network } from '@ionic-native/network';
import { Storage } from '@ionic/storage';

import { AngularFireDatabase} from 'angularfire2/database-deprecated';
import { AngularFireAuth } from 'angularfire2/auth';

import { UserService } from '../../../services/user.service';

//Geolocation
import { Geolocation } from '@ionic-native/geolocation';

@IonicPage()
@Component({
  selector: 'page-cards',
  templateUrl: 'cards.html'
})
export class CardsPage {

  public search:  {
    client: '',
    entity: ''
  };
  public entityName: any;
  public forms: any;
  public allForms: any;
  public imgForm: object = {
    // typeStore: "https://firebasestorage.googleapis.com/v0/b/survey-store.appspot.com/o/forms_images%2Fstore%203.png?alt=media&token=212f12e9-fa5a-48c1-b918-1e3cb8d588c3",
    // typePerson: "https://firebasestorage.googleapis.com/v0/b/survey-store.appspot.com/o/forms_images%2Fpersonas%201.png?alt=media&token=484b573d-3517-44ad-b5e6-ea88d4acefe9",
    typeStore: "..\assets\img\store.png",
    typePerson: "..\assets\img\person.png",
  };
  
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
    public network: Network,
    public cardsList: CardsProvider,
    private geolocation: Geolocation,
    public storage: Storage) {
    
      let data = navParams.get('data');

      this.search = data.search;
      this.entityName = data.entityName;

  }

  
  getForms(ev: any){
    // set val to the value of the searchbar
    const val = ev.target.value;
    
    //incializamos nuevamente con todos los formularios
    this.forms = this.allForms
    // if the value is an empty string don't filter the items
    
    if (val && val.trim() != '') {
      this.forms = this.forms.filter((form) => {
        return (form.Title.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
    
    
  }

  ionViewWillEnter(){
  let ion = this;
  
  if (ion.isOnDevice()) 
  {
    if (ion.isOnline()) 
    {
      //Versión Online
      this.getAllFormsOnline()
    } else {
      //Versión Offline
      this.getAllFormsOffline()
    }
  } else 
  {  
    console.log('Is on browser!');
    
    //Versión Online
    this.getAllFormsOnline()
      
    //Versión Offline
    this.getAllFormsOffline()
    
  }
  // //Test GeoLocation
  // this.geolocation.getCurrentPosition().then((resp) => {
  //   // resp.coords.latitude
  //   // resp.coords.longitude
  //   console.log(resp.coords);
    
  //  }).catch((error) => {
  //    console.log('Error getting location', error);
  //  });
    
  }

  isOnline(): boolean {
    return  this.network.type !== 'none'
  }
  
  isOnDevice():boolean {
    return this.network.type !== null
  }

  getAllFormsOnline(){
    let ion = this
    //console.log('new view', this.search);
    ion.cardsList.getAllFormsByUserClientAndEntity(this.search).then(AllForms => {
        //console.log('new view forms', AllForms);
        ion.forms = AllForms;
        this.allForms = this.forms

        //console.log('resolved view', AllForms);
        
    }).catch(err => {
      ion.toastCtrl.create({
        message: 'This entity doesnt have any form, please select another.',
        duration: 3000
      }).present();
    });
  }

  getAllFormsOffline() {
    this.storage.get('allForms').then((AllForms) => {
      //console.log('todos: ', AllForms.filter(form => form.IdClient == this.search.client && form.IdEntitie == this.search.entity));
      this.forms = AllForms.filter(form => form.IdClient == this.search.client && form.IdEntitie == this.search.entity && form.userStatus != 3);
      this.allForms = this.forms
    }).catch((er) =>{
        console.log(er);
    });
  }

  goForm(idForm, nameForm, status) {
    let ion = this;
   
    ion.navCtrl.push('FormsPage', {
      data: {
        idForm: idForm,
        nameForm: nameForm,
        statusForm: status,
      }
    });
  }

  getFormStatusColor(status) {
    if (status == 1) {
      return 'secondary';
    } else if (status == 2){
      return 'ios-orange';
    } else {
      return 'ios-green';
    }
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