
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
    async getAllEntitiesByUser(clientId): Promise<any> {
        let ion = this;
        let arr = [];
        let EntitieArrKey = [];
        let EntitieArr = [];
        let EntitieSet = [];
        console.log(clientId);
        
        return await new Promise(async (resolve, reject) => {
            try{
                var itemsProcessed = 0;
                let authUser = await ion.authData.getAuthUser();
                var forms = await this.db.collection("forms");
                forms.where("IdClient", "==", clientId).get()
                .then(async (entitiesSnapShot) => {
                    if(entitiesSnapShot.size == 0)
                    {
                        console.log("entro aqui");
                        
                        reject();
                    }
                    entitiesSnapShot.forEach(function (doc) {
                        var obj = JSON.parse(JSON.stringify(doc.data()));
                        obj.$key = doc.id
                        arr.push(obj);
                    })
                    console.log(arr);
                    // debugger
                    for await (const form of arr) {
                        let itemsProcessedFormUser = 0;
                        var form_user = await this.db.collection("forms_users");
                        form_user.where("id_form", "==", form.$key).where("id_user", "==", authUser.uid).get()
                        .then(async (entitiesSnapShot) => {
                            itemsProcessed++;
                            entitiesSnapShot.forEach(async function (doc) {
                                // EntitieArrKey.push(doc.data());
                                
                                var obj = await JSON.parse(JSON.stringify(doc.data()));
                                // obj.$key = doc.id
                                var ent = {
                                    Name: obj.entity_name,
                                    // id_entity: obj.id_entity,
                                    $key: obj.id_entity
                                }
                                console.log(ent);
                                if(EntitieSet.find( entity => entity.$key === ent.$key ) === undefined)
                                    EntitieSet.push(ent);
                            })
                            
                            if(itemsProcessed === arr.length) {
                                
                                if (EntitieSet.length >= 1) {
                                    console.log(EntitieSet);
                                    await resolve(EntitieSet);
                                } else {
                                    await reject();
                                }
                            }
                        }).catch(async err => {
                            console.log(err);
                            
                            await reject(err);
                        });
                        
                        
                    }
                    //  console.log(EntitieSet);
                    
                    //  resolve(EntitieSet);
                  
                }).catch((err)=>{
                    console.log(err);

                    reject(err)
                })
                // await reject();
            }
            catch(err){
                    console.log(err);
                    reject(err);
            }
        })

    }
    async getAllEntities(): Promise<any> {
        let ion = this;
        let arr =[];
        let EntitieSet = [];
        
         
        return await new Promise(async (resolve, reject) => {
            try{
                var itemsProcessed = 0;
                let authUser = await ion.authData.getAuthUser();
                var forms = await this.db.collection("forms");
                forms.where("status", "==", "1").get()
                .then(async (entitiesSnapShot) => {
                    if(entitiesSnapShot.size == 0)
                    {
                        console.log("entro aqui");
                        
                        reject();
                    }
                    entitiesSnapShot.forEach(function (doc) {
                        var obj = JSON.parse(JSON.stringify(doc.data()));
                        obj.$key = doc.id
                        arr.push(obj);
                    })
                    console.log(arr);
                    // debugger
                    for await (const form of arr) {
                        let itemsProcessedFormUser = 0;
                        var form_user = await this.db.collection("forms_users");
                        form_user.where("id_form", "==", form.$key).where("id_user", "==", authUser.uid).get()
                        .then(async (entitiesSnapShot) => {
                            itemsProcessed++;
                            entitiesSnapShot.forEach(async function (doc) {
                                // EntitieArrKey.push(doc.data());
                                
                                var obj = await JSON.parse(JSON.stringify(doc.data()));
                                // obj.$key = doc.id
                                
                                var ent = {
                                    Name: obj.entity_name,
                                    client_name: form.clientName,
                                    id_entity: obj.id_entity,
                                    // id_form: obj.id_form,
                                    id_client: form.IdClient,
                                    $key: obj.id_entity
                                }
                                console.log(ent);
                                //if(EntitieSet.find( entity => entity.$key === ent.$key ) === undefined)
                                    EntitieSet.push(ent);
                            })
                            
                            if(itemsProcessed === arr.length) {
                                
                                if (EntitieSet.length >= 1) {
                                    console.log(EntitieSet);
                                    await resolve(EntitieSet);
                                } else {
                                    await reject();
                                }
                            }
                        }).catch(async err => {
                            console.log(err);
                            
                            await reject(err);
                        });
                        
                        
                    }
                    //  console.log(EntitieSet);
                    
                    //  resolve(EntitieSet);
                  
                }).catch((err)=>{
                    console.log(err);

                    reject(err)
                })
                // await reject();
            }
            catch(err){
                    console.log(err);
                    reject(err);
            }
        })   
        

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
                .where("id_entity", "==", searchData.entity)
                .get().then((formsUsersSnapShot) => {
                    formsUsersSnapShot.forEach(function (doc) {
                        var obj = JSON.parse(JSON.stringify(doc.data()));
                        obj.$key = doc.id
                        arr.push(obj);
                    });
                    console.log(arr);
                    
                    arr.forEach(element => {
                        var forms = this.db.collection("forms").doc(element.id_form).get()
                        .then(function(doc) {
                            itemsProcessed++;

                            var objForm = JSON.parse(JSON.stringify(doc.data()));
                            if (objForm.status == 1 && objForm.IdClient==searchData.client) {
                                objForm.$key = doc.id
                                objForm.userStatus = element.status
                                
                                FormArr.push(objForm);
                            }
                            if (objForm.status == 2 && objForm.IdClient==searchData.client) {
                               
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
                        }).catch(err =>{
                            console.log(err);
                            reject(err);
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
                                objForm.id_entity = element.id_entity
                                objForm.entity_name = element.entity_name
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
