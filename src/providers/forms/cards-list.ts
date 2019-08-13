
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http'
import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import 'firebase/firestore';
import { UserService } from '../../services/user.service';
import { AuthData } from '../../providers/auth-data';
import { Storage } from '@ionic/storage';


@Injectable()
export class CardsProvider {
  private db: any;

  constructor(private http: HttpClient, 
    public userService: UserService, 
    public authData: AuthData, 
    public storage: Storage) {
    this.db = firebase.firestore();
    this.storage.get('allForms').then(sd=>{
        console.log(sd);
        
    }).catch(e =>{
        console.log(e);
        
    })
  }

    getAllClients(): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                var clients = this.db.collection("clients").get()
                .then((clientsSnapShot) => {
                let arr = [];
                clientsSnapShot.forEach(function (doc) {
                    var obj = JSON.parse(JSON.stringify(doc.data()));
                    obj.$key = doc.id
                    arr.push(obj);

                    resolve(arr);
                });
            });
                
            } catch (error) {
                reject(error);
            }
        });
    }

    getAllEntitiesByUser(clientId): Promise<any> {
        let ion = this;
        let arr = [];
        let EntitieArr = [];
        
        return new Promise((resolve, reject) => {
            try {
                let authUser = ion.authData.getAuthUser();
                var entities_user = this.db.collection("entities_users");
                entities_user.where("IdClient", "==", clientId).where("IdUser", "==", authUser.uid).get()
                .then((entitiesSnapShot) => {
                    entitiesSnapShot.forEach(function (doc) {
                        var obj = JSON.parse(JSON.stringify(doc.data()));
                        obj.$key = doc.id
                        arr.push(obj);
                    });
                    arr[0].Id_entity.forEach(element => {
                        var entitie = this.db.collection("entities").doc(element.entity_id)
                        entitie.get().then(function(doc) {
                            //console.log(doc.data());
                            var objEntitie = JSON.parse(JSON.stringify(doc.data()));
                            objEntitie.$key = doc.id
                            EntitieArr.push(objEntitie);
                        });
                    });
                    resolve(EntitieArr);
                }).catch(err => {
                    reject(err);
                });
            } catch (error) {
                reject(error);
            }
        });
    }


    getAllEntitiesAndAllClientByUser(): Promise<any> {
        let ion = this;
        let arr = [];
        let EntitieArr = [];
        
        return new Promise((resolve, reject) => {
            try {
                let authUser = ion.authData.getAuthUser();
                var entities_user = this.db.collection("entities_users");
                entities_user.where("IdUser", "==", authUser.uid).get()
                .then((entitiesSnapShot) => {
                    entitiesSnapShot.forEach(function (doc) {
                        var obj = JSON.parse(JSON.stringify(doc.data()));
                        obj.$key = doc.id
                        arr.push(obj);
                    });
                    for (let ii = 0; ii < arr.length; ii++) {
                        let cont = 0
                        arr[ii].Id_entity.forEach(element => {
                            var entitie = this.db.collection("entities").doc(element.entity_id)
                            entitie.get().then(function(doc) {
                                //console.log(doc.data());
                                var objEntitie = JSON.parse(JSON.stringify(doc.data()));
                                objEntitie.$key = doc.id
                                objEntitie.idClient = arr[ii].IdClient
                                EntitieArr.push(objEntitie);
                                console.log(objEntitie);
                                
                                cont++
                                if (ii == (arr.length - 1) && cont == (arr[ii].Id_entity.length - 1) ) {
                                    resolve(EntitieArr);
                                    
                                }
                            });
                            
                        });
                        
                    }
                    
                }).catch(err => {
                    reject(err);
                });
            } catch (error) {
                reject(error);
            }
        });
    }


    //For maptoEntity page
    getAllFormsByClientAndEntitie(searchData): Promise<any> {
        let arrForms = [];
        return new Promise((resolve, reject) => {
            try {
                var forms = this.db.collection("forms")
                .where("IdClient", "==", searchData.client).where("IdEntitie", "==", searchData.entity).get()
                .then((formsSnapShot) => {
                formsSnapShot.forEach(function (doc) {
                    var objForm = JSON.parse(JSON.stringify(doc.data()));
                    objForm.$key = doc.id
                    arrForms.push(objForm);
                });
                if (arrForms.length >= 1) {
                    resolve(arrForms);
                } else {
                    reject();
                }
            }).catch(err => {
                reject(err);
            });
                
            } catch (error) {
                reject(error);
            }
        });
    }

    //For cards page
    getAllFormsByUserClientAndEntity(searchData): Promise<any> {
        let ion = this;
        let arr = [];
        let FormArr = [];
        
        return new Promise((resolve, reject) => {
            var itemsProcessed = 0;
            try {
                let authUser = ion.authData.getAuthUser();
                var forms_users = this.db.collection("forms_users");
                forms_users.where("id_user", "==", authUser.uid)
                //intento de cambiar base de datos a que el id de entidad y de cliente estén en forms_usersd
                .where("IdClient", "==", searchData.client)
                .where("IdEntitie", "==", searchData.entity)
                .get().then((formsUsersSnapShot) => {
                    formsUsersSnapShot.forEach(function (doc) {
                        var obj = JSON.parse(JSON.stringify(doc.data()));
                        obj.$key = doc.id
                        arr.push(obj);
                    });
                    arr.forEach(element => {
                        var forms = this.db.collection("forms").doc(element.id_form).get()
                        .then(function(doc) {
                            itemsProcessed++;
                            var objForm = JSON.parse(JSON.stringify(doc.data()));
                            if (objForm.status == 1 && objForm.IdClient==searchData.client && objForm.IdEntitie==searchData.entity) {
                                objForm.$key = doc.id
                                objForm.userStatus = element.status
                                
                                FormArr.push(objForm);
                            }
                            if (objForm.status == 2 && objForm.IdClient==searchData.client && objForm.IdEntitie==searchData.entity) {
                               
                                objForm.$key = doc.id
                                objForm.userStatus = element.status
                                
                                FormArr.push(objForm);
                            } 
                            if(itemsProcessed === arr.length) {
                                if (FormArr.length >= 1) {
                                 resolve(FormArr);
                                } else {
                                 reject();
                                }
                            }
                        });
                    });
                }).catch(err => {
                    reject(err);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    //Un gran arreglo de formularios
    getAllFormsByUser(): Promise<any> {
        let ion = this;
        let arr = [];
        let FormArr = [];
        
        return new Promise((resolve, reject) => {
            var itemsProcessed = 0;
            try {
                let authUser = ion.authData.getAuthUser();
                var forms_users = this.db.collection("forms_users");
                forms_users.where("id_user", "==", authUser.uid).get()
                .then((formsUsersSnapShot) => {
                    formsUsersSnapShot.forEach(function (doc) {
                        var obj = JSON.parse(JSON.stringify(doc.data()));
                        obj.$key = doc.id
                        arr.push(obj);
                    });
                    arr.forEach(element => {
                        var forms = this.db.collection("forms").doc(element.id_form).get()
                        .then(function(doc) {
                            itemsProcessed++;
                            var objForm = JSON.parse(JSON.stringify(doc.data()));
                            if (objForm.status == 1 || objForm.status == 2) { 
                                // && objForm.IdClient==searchData.client && objForm.IdEntitie==searchData.entity) {
                                objForm.$key = doc.id
                                objForm.userStatus = element.status
                                
                                FormArr.push(objForm);
                            } 
                            if(itemsProcessed === arr.length) {
                                if (FormArr.length >= 1) {
                                 resolve(FormArr);
                                } else {
                                 reject();
                                }
                            }
                        });
                    });
                }).catch(err => {
                    reject(err);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

}
