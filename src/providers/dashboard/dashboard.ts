import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import 'firebase/firestore';
import { AuthData } from '../../providers/auth-data';
import { AngularFirestore } from 'angularfire2/firestore';
import { UserService } from '../../services/user.service';
import { CardsProvider } from '../../providers/forms/cards-list';
import { Storage } from '@ionic/storage';
import { catchError } from 'rxjs/operators';

/*
  Generated class for the DashboardProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class DashboardProvider {
  private db: any;

    constructor(public http: HttpClient, public userService: UserService, private afs: AngularFirestore,
    public authData: AuthData, public cardsList: CardsProvider, public storage: Storage) 
    {
        this.db = firebase.firestore();
    }

    getTotalEntitiesByUser(): Promise<any> {
        let ion = this;
        let arr = [];
        return new Promise((resolve, reject) => {
            try {
                let authUser = ion.authData.getAuthUser();
                var entities_users = this.db.collection("entities_users");
                entities_users.where("IdUser", "==", authUser.uid)
                .get().then((entitiesSnapShot) => {
                    entitiesSnapShot.forEach(function (ii) {
                        var ent = JSON.parse(JSON.stringify(ii.data()));
                        //entities per client
                        ent.Id_entity.forEach(function (jj) {
                            let entC = jj
                            entC.$key = jj.id
                            arr.push(entC);  
                        })
                        //arr.push(ent.Id_entity);
                        //console.log(ent);
                    });
                    resolve(arr);
                }).catch(err => {
                    reject();
                });
            }catch(error)
            {
                console.log(error);
                reject();
            }
        })

    }

    getTotalFormsByUser(): Promise<any> {
        let ion = this;
        let arr = [];
        return new Promise((resolve, reject) => {
            try {
                let authUser = ion.authData.getAuthUser();
                var form_users = this.db.collection("forms_users");
                form_users.where("id_user", "==", authUser.uid)
                .get().then((formsSnapShot) => {
                    formsSnapShot.forEach(function (ii) {
                        var ent = JSON.parse(JSON.stringify(ii.data()));
                        ent.$key = ii.id
                        arr.push(ent);
                        //console.log(ent);
                    });
                    resolve(arr);
                }).catch(err => {
                    reject();
                });
            }catch(err){
                console.log(err);
            }
        })
    }

    getTotalFormsByEntitie(entitie): Promise<any> {
        let ion = this;
        let arr = [];
        let arrForm = [];
        return new Promise((resolve, reject) => {
            var itemsProcessed = 0;
            try {
                let authUser = ion.authData.getAuthUser();
                var form_user = this.db.collection("forms_users");
                form_user.where("id_user", "==", authUser.uid)
                .get().then((formsSnapShot) => {
                    formsSnapShot.forEach(function (ii) {
                        var ent = JSON.parse(JSON.stringify(ii.data()));
                        ent.$key = ii.id
                        arr.push(ent);
                    });
                    arr.forEach(element => {
                        var forms = this.db.collection("forms").doc(element.id_form).get()
                        .then(function(doc) {
                            itemsProcessed++;
                            var form = JSON.parse(JSON.stringify(doc.data()));
                            if (form.status == 1 && form.IdEntitie == entitie) {
                                form.$key = doc.id
                                form.userStatus = element.status
                                
                                arrForm.push(form);
                            } 
                            if(itemsProcessed === arr.length) {
                                if (arrForm.length >= 1) {
                                 resolve(arrForm);
                                } else {
                                 reject();
                                }
                            }
                        });
                    });
                }).catch(err => {
                    reject();
                });
            }catch(err){
                console.log(err);
            }
        })
    }

    getTotalNoSincEntities(): Promise<any> {
        
        let ion = this;
        let entUser = []; //Entities by user
        let noSyncEnt = []; //Entities no synchronize
        return new Promise((resolve, reject) => {
           
            try {
                let authUser = ion.authData.getAuthUser();
                var entities_users = this.db.collection("entities_users");
                /* Obtain entities by User */
                entities_users.where("IdUser", "==", authUser.uid)
                .get().then((entitiesSnapShot) => {
                    entitiesSnapShot.forEach(function (ii) {
                        var ent = JSON.parse(JSON.stringify(ii.data()));
                        //entities per client
                        ent.Id_entity.forEach(function (jj) {
                            entUser.push(jj);  
                            //console.log(jj);
                        })
                        
                    });
                    var itemsProcessed = 0;
                    
                    entUser.forEach(ent => {
                        itemsProcessed++;
                        
                        this.getTotalFormsByEntitie(ent.entity_id).then(AllEntities => {
                            
                            for (let element of AllEntities) 
                            {
                                if (element.userStatus != 3)
                                {
                                    noSyncEnt.push(ent.entity_id);
                                    break;   
                                }
                            }
                            if(itemsProcessed === entUser.length){
                                resolve(noSyncEnt);
                            }else{
                                reject();
                            }
                        }).catch((err) =>{
                            console.log(err);
                        });
                         
                    });
                }).catch(err => {
                    reject();
                });
            }catch(error)
            {
                console.log(error);
                reject();
            }
        })
    }

    
}
