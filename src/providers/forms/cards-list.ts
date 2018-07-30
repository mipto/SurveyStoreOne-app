
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http'
import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import 'firebase/firestore';
import { UserService } from '../../services/user.service';
import { AngularFirestore } from 'angularfire2/firestore';
import { AuthData } from '../../providers/auth-data';
import { ArrayObservable } from 'rxjs/observable/ArrayObservable';


@Injectable()
export class CardsProvider {
  private db: any;

  constructor(private http: HttpClient, public userService: UserService, private afs: AngularFirestore,
    public authData: AuthData) {
    this.db = firebase.firestore();
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
                        var entitie = this.db.collection("entities").doc(element)
                        entitie.get().then(function(doc) {
                            console.log(doc.data());
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

}
