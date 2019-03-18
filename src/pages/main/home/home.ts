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
    public storage: Storage) {

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

  
  ionViewCanEnter(){
    let ion = this;
    let loadingPopupHome = ion.loadingCtrl.create({
      spinner: 'crescent', 
      content: ''
    });
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
    //Versión online
    //Se debe iterar en clientes para hacer la consulta:
    //ion.cardsList.getAllEntitiesByUser(allClient[i])
    //y esas entidades se guardan en otro arreglo que sería
    //entidades[nombreClient]
     
    ion.cardsList.getAllClients().then(async Allclients => {
      ion.clients = Allclients;
      this.storage.set('Allclients', ion.clients);
      this.storage.get('Allclients').then(client =>{
        ion.clients = client;
      })
     
      //Obtenemos TODAS las entidades por cliente
      //Función aparte
      // this.getEntitiesByUser(Allclients).then(allEnt =>{
      //   console.log(allEnt);
      //   //this.storage.set('entitiesByUser',allEnt)
        
      // })
     
      ion.dashboard.getTotalEntitiesByUser().then(AllEnt =>{
        console.log(AllEnt);
        this.storage.set('entitiesByUser', AllEnt)
      }).catch((error)=>{
        console.log(error);
        
      })
      loadingPopupHome.dismiss();
        
    });
   
    
    //Versión offline
    //ion.clients = Allclienst del storage
    this.storage.get('Allclients').then((clients) => {
      //Usamos lo que está en el storage
      ion.clients = clients;

    }).catch((er) =>{
        console.log(er);
    });
  }

  onClientSelectChange(selectedValue: any) {
    let ion = this;
    let loadingPopupHome = ion.loadingCtrl.create({
      spinner: 'crescent', 
      content: ''
    });
    
    console.log(ion.search);
    
    //Versión Online
    ion.cardsList.getAllEntitiesByUser(selectedValue).then(AllEntities => {
      ion.entities = AllEntities;

      loadingPopupHome.dismiss();
    }).catch(err => {
      ion.entities = null;
      ion.toastCtrl.create({
          message: 'This client doesnt have entities, please select another.',
          duration: 3000
        }).present();
    });

    //Versión Offline
    this.storage.get('entitiesByUser').then(ent =>{
      console.log(ent);
      ent.forEach(element => {
        if (element.$key == selectedValue) {
          console.log(element);
          
        }
      });
    })
  }
  ionViewDidEnter() {
    
    this.network.onConnect().subscribe(data => {
      console.log(data, ' ', this.network.type)
    }, error => console.error(error));
   
    this.network.onDisconnect().subscribe(data => {
      console.log(data, ' ', this.network.type)
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