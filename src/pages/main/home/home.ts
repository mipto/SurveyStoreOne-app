import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController , ToastController, Platform} from 'ionic-angular';
import { AuthData } from '../../../providers/auth-data';
import { CardsProvider } from '../../../providers/forms/cards-list';
import { Globals } from '../../../services/globals.service';
import { Storage } from '@ionic/storage';

import { AngularFireDatabase } from 'angularfire2/database-deprecated';
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
  public appIsOnDevice: any;

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
    public platform: Platform,
    public formProvider: FormsProvider) {

      let ion = this;
      ion.appIsOnDevice = !this.platform.url().startsWith('http');

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

  isOnline(): boolean {
    return  this.network.type !== 'none'
  }

  isOnDevice():boolean {
    return this.network.type !== null
  }

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
    if(ion.isOnDevice())
    {
      if(ion.isOnline())
      {
        //Data de pantalla de Home
  
        //Versión online
        ion.loadHomeDataOnline()
        //Data de pantalla de Cards
        ion.loadFormDataOnline(loadingPopupHome)
        
      }else{
          //Versión offline
          ion.loadHomeDataOffline(loadingPopupHome)
        
      }

    }else{
      //Data de pantalla de Home
  
      //loadingPopupHome.dismiss();
      //Versión online
      ion.loadHomeDataOnline()
      // //Versión offline
       ion.loadHomeDataOffline(loadingPopupHome)
  
      // //Data de pantalla de Cards
      ion.loadFormDataOnline(loadingPopupHome)
      

    }
  }
  
  loadFormDataOnline(loadingPopupHome) {
    let ion = this
    let aux
    Promise.all([ ion.storage.get('changeForms')]).then(([change]) =>{
      // console.log(change);
      
      if(change === null || change === undefined)
        ion.storage.set('changeForms', [])

    })
    
    
    ion.cardsList.getAllFormsByUser().then(AllForms =>{
      // console.log('allForms (consulta): ',AllForms)
      
      this.storage.set('allForms', AllForms)
      //Data de pantalla de Formulario
      ion.formProvider.getAllDocumentsForAllForms(AllForms)
      .then(All =>{
        // console.log('Questions (consulta):', All[0]);
        setTimeout(() => {
          //obtener aparte las posiciones de los formularios que son pendientes para que NO se pierdan
          
            console.log(All);
            
            this.storage.set('allFormsQA',  All).then(elementsSaved => {
              console.log('ressss', elementsSaved);
            
            }); 
          
        }, 3500);
        //this.createQuestiosAnswerArray(All)
        loadingPopupHome.dismiss();
       
  
      }).catch(e =>{
        console.log(e);  
      })
    }).catch(e =>{
      console.log(e);  
      loadingPopupHome.dismiss()
      this.navCtrl.push('LoginPage')
    })
  }
  loadHomeDataOffline(loadingPopupHome) {
    let ion = this
    this.storage.get('Allclients').then((clients) => {
      //Usamos lo que está en el storage
      ion.clients = clients;
      //console.log(ion.clients);
      
     // loadingPopupHome.dismiss();
      
    }).catch((er) =>{
        console.log(er);
     // loadingPopupHome.dismiss();

    });
  }

  loadHomeDataOnline() {
    let ion = this
    console.log('hola');
    
    ion.cardsList.getAllEntities().then(All =>{
      
      console.log(All);
      this.storage.set('entitiesByUser', All)
       
    }).catch((e) =>{
      console.log(e);
      
    });
    ion.cardsList.getAllClients().then( Allclients => {
      ion.clients = Allclients;
      this.storage.set('Allclients', ion.clients);
      
     /*

      ion.dashboard.getTotalEntitiesByUser().then(AllEnt =>{
        //Solo tenemos los Id's asociados a un cliente
        this.storage.set('entitiesByUserAndClient', AllEnt)
      }).catch((error)=>{
        console.log(error);
        
      })
      */
      // ion.dashboard.getTotalDataEntities().then(AllEnt =>{
      //   //Estan los datos de cada entidad 
      //   console.log(AllEnt)
      //   this.storage.set('entitiesByUser', AllEnt)
      // }).catch((error)=>{
      //   console.log(error);
        
      // })

      // loadingPopupHome.dismiss();
        
    });
    
  }
 
  onClientSelectChange(selectedValue: any) {
    let ion = this;
    
    //console.log(ion.search);
    if(ion.isOnDevice())
    {
          
      if(ion.isOnline())
      {
        //Versión Online
        ion.getEntitiesOnline(selectedValue)
     
      }else{
        //versión Offline
        ion.getEntitiesOffline(selectedValue)
  
      }
    }else{
      
      //Versión Online
     ion.getEntitiesOnline(selectedValue)
      
      //Versión Offline
      ion.getEntitiesOffline(selectedValue)
    
    }
  }

 
  getEntitiesOffline(selectedValue: any): any {
    let ion = this
    let arrEnt=[];
    let loadingPopupHome = ion.loadingCtrl.create({
      spinner: 'crescent', 
      content: ''
    });
    loadingPopupHome.present()
   
        this.storage.get('entitiesByUser').then(data =>{
          data = data.filter(k => k.id_client === selectedValue)
          let sinRepetidos = data.filter((valorActual, indiceActual, arreglo) => {
            //Podríamos omitir el return y hacerlo en una línea, pero se vería menos legible
            return arreglo.findIndex(valorDelArreglo => JSON.stringify(valorDelArreglo) === JSON.stringify(valorActual)) === indiceActual
           });
          //Se buscan los datos de las entidades como tal
          console.log(sinRepetidos);
          if(sinRepetidos === []){
            ion.entities = null;
            ion.toastCtrl.create({
                message: 'This client doesnt have entities, please select another.',
                duration: 3000
              }).present();
          }else{
            ion.entities = sinRepetidos;

          }
          loadingPopupHome.dismiss();
          
        })
        //loadingPopupHome.dismiss();
        
        

    
  }
  async parserSet(set){
    let entity = [];
    console.log(set);
    
    for (let iterator of set) {
   await console.log(JSON.parse(iterator));
//      entity.push(JSON.parse(iterator));
     console.log(iterator);
    }
    set.forEach(element => {
      console.log(element);
      
    });
  }
  getEntitiesOnline(selectedValue) {
    let ion = this
    let loadingPopupHome = ion.loadingCtrl.create({
      spinner: 'crescent', 
      content: ''
    });
    loadingPopupHome.present();
    
    ion.cardsList.getAllEntitiesByUser(selectedValue).then(all =>{
        console.log(all);
        ion.entities = all;
        loadingPopupHome.dismiss();
     
    }).catch(err =>{
      console.log(err);
      ion.entities = null;
      ion.toastCtrl.create({
              message: 'This client doesnt have entities, please select another.',
              duration: 3000
            }).present();
      loadingPopupHome.dismiss();
      
    })
    

  }
  ionViewDidEnter() {
    
   
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
    console.log(entity);
    
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