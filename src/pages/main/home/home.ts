import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController , ToastController} from 'ionic-angular';
import { AuthData } from '../../../providers/auth-data';
import { CardsProvider } from '../../../providers/forms/cards-list';
import { Globals } from '../../../services/globals.service';
import { Storage } from '@ionic/storage';

import { AngularFireDatabase} from 'angularfire2/database-deprecated';
import { AngularFireAuth } from 'angularfire2/auth';
import { Network } from '@ionic-native/network';

import { UserService } from '../../../services/user.service';
import { storage } from 'firebase';
import { MapOperator } from 'rxjs/operators/map';
import { DashboardProvider } from '../../../providers/dashboard/dashboard';
import { FormsProvider } from '../../../providers/forms/forms';
import { timeout } from 'rxjs/operators';
import { timeoutWith } from 'rxjs/operator/timeoutWith';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  public search: any;

  public clients: any;
  public entities: any;
  public lastConnect: string;

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
    public dashboard: DashboardProvider,
    public storage: Storage,
    public formProvider: FormsProvider) {

      let ion = this;

      ion.search = {
        client: null,
        entity: null
      };

      storage.get('last_connection').then((last_con) => {
        //console.log('ultima conexion: ', last_con);
        this.lastConnect =  last_con;
      }).catch((er) =>{
          console.log(er);
      });
    
  }

  //Hacer absolutamente todas las consultas necesarias?
  
  ionViewCanEnter(){
    let ion = this;
    let loadingPopupHome = ion.loadingCtrl.create({
      spinner: 'crescent', 
      content: ''
    });
    loadingPopupHome.present();

    if (this.navParams.get('data')) {
      let data = this.navParams.get('data');
      if (data.selectedEntity && data.selectedClient) {
        console.log('home with selected entity', data.selectedEntity);
        console.log('home with selected client', data.selectedClient);
        
        ion.search.client = data.selectedClient;
        ion.onClientSelectChange(ion.search.client);
        ion.search.entity = data.selectedEntity;
      }
    };

    //Data de pantalla de Home

    //Versión online
    ion.cardsList.getAllClients().then( Allclients => {
      ion.clients = Allclients;
      this.storage.set('Allclients', ion.clients);
      this.storage.get('Allclients').then(client =>{
        ion.clients = client;
      })
     

      ion.dashboard.getTotalEntitiesByUser().then(AllEnt =>{
        console.log(AllEnt);
        //Solo tenemos los Id's asociados a un cliente
        this.storage.set('entitiesByUserAndClient', AllEnt)
      }).catch((error)=>{
        console.log(error);
        
      })
      ion.dashboard.getTotalDataEntities().then(AllEnt =>{
        console.log(AllEnt);
        //Estan los datos de cada entidad 
        this.storage.set('entitiesByUser', AllEnt)
      }).catch((error)=>{
        console.log(error);
        
      })

      // loadingPopupHome.dismiss();
        
    });
   
    //Versión offline
    this.storage.get('Allclients').then((clients) => {
      //Usamos lo que está en el storage
      ion.clients = clients;
    }).catch((er) =>{
        console.log(er);
    });


    //Data de pantalla de Cards
    ion.cardsList.getAllFormsByUser().then(AllForms =>{
      console.log('allForms (consulta): ',AllForms)
      
      //this.storage.set('allForms (storage): ', AllForms)
      //Data de pantalla de Formulario
      ion.formProvider.getAllDocumentsForAllForms(AllForms)
      .then(All =>{
        // console.log('Questions (consulta):', All[0]);
        setTimeout(() => {
          this.storage.set('allFormsQA',  All).then(elementsSaved => {
            //console.log('ressss', elementsSaved);
          
          }); 
        }, 1500);
        this.createQuestiosAnswerArray(All)
        loadingPopupHome.dismiss();
       
  
      }).catch(e =>{
        console.log(e);  
      })
    }).catch(e =>{
      console.log(e);  
    })
    

  }
  createQuestiosAnswerArray(AllForm)
  {
    let arr = []
    for (const key in AllForm) {
      if (AllForm.hasOwnProperty(key)) {
        const form = AllForm[key];
        //console.log(key)
        
        for (const ii in form) {
          var obj ={
            nForm: '',
            hierK:'',
            questions:{}
          }
          obj.nForm = key
          if (form.hasOwnProperty(ii)) {
            const hierarchy = form[ii];
            //console.log('key: ', hierarchy.$key,' ', hierarchy.questions);
            obj.hierK = hierarchy.$key  
            obj.questions =(hierarchy.questions)
            
            arr.push(obj)
            
          }
        }
      }
    }
    console.log('arrayQA', arr);
    this.storage.set('arrayQA', arr).catch(e => console.log(e));
    
    this.storage.get('arrayQA').then(a => {
      console.log('arrayQA (Storage): ', a);
      
    })
    
  }
  onClientSelectChange(selectedValue: any) {
    let ion = this;
    let loadingPopupHome = ion.loadingCtrl.create({
      spinner: 'crescent', 
      content: ''
    });
    //console.log(ion.search);
    
    //Versión Online
   /* ion.cardsList.getAllEntitiesByUser(selectedValue).then(AllEntities => {
      ion.entities = AllEntities;
      console.log(AllEntities);
      
      loadingPopupHome.dismiss();
    }).catch(err => {
      ion.entities = null;
      ion.toastCtrl.create({
          message: 'This client doesnt have entities, please select another.',
          duration: 3000
        }).present();
    });*/

    //Versión Offline
    this.storage.get('entitiesByUserAndClient').then(ent =>{
      let entSelect = []
      if (ent.length > 0) {
        ent.forEach(element => {
          if (element.$key == selectedValue) {
            this.storage.get('entitiesByUser').then(data =>{
              //Se buscan los datos de las entidades como tal
              let find = data.find(k => k.$key === element.entity_id)
              if (find !== undefined) {
                entSelect.push(find);
              } 
            })
          }
        });
        
        console.log(entSelect);
        ion.entities = entSelect
        loadingPopupHome.dismiss();
        
      } else {
        ion.entities = null;
        ion.toastCtrl.create({
            message: 'This client doesnt have entities, please select another.',
            duration: 3000
          }).present();
      }

    })
  }
  ionViewDidEnter() {
    
    this.network.onConnect().subscribe(data => {
      console.log(data, ' ', this.network.type)
      this.toastCtrl.create({
        message: 'This client is online.',
        duration: 3000
      }).present();
    }, error => console.error(error));
   
    this.network.onDisconnect().subscribe(data => {
      console.log(data, ' ', this.network.type)
      this.toastCtrl.create({
        message: 'This client is offline.',
        duration: 3000
      }).present();
    }, error => console.error(error));
  }
  
  searchEntity() {
    let ion = this;
    
    ion.navCtrl.push('SearchEntityPage', {
      data: {
        entities: ion.entities,
        selectedClient: ion.search.client
      }
    });
  }

  searchForm() {
    let ion = this;
    console.log(ion.search);

    let entity = this.entities.find(x => x.$key === ion.search.entity);
    
    ion.navCtrl.push('CardsPage', {
      data: {
        search: ion.search,
        entityName: entity.Name
      }
    });
  }

  goMapToEntity() {
    let ion = this;
    console.log(ion.search);
    
    ion.navCtrl.push('MapToEntityPage', {
      data: ion.search
    });
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