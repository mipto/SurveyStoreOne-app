import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http'
import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import 'firebase/firestore';
/*
  Generated class for the FormsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class FormsProvider {
  private db: any;
  model: any = {};
  public array: any = {};

  constructor(private http: HttpClient) {
    this.db = firebase.firestore();
    this.array = [];
  }

  getAllDocuments(): Promise<any> {

    return new Promise((resolve, reject) => {
      var forms = this.db.collection("hierarchy_form");// Create a query against the collection.
      var query = forms.where("Id_form", "==", '1');

      query
        .get()
        .then((querySnapshot) => {
          let arr = [];
          querySnapshot.forEach(function (doc) {
            var obj = JSON.parse(JSON.stringify(doc.data()));
            obj.$key = doc.id
            arr.push(obj);
          });

          if (arr.length > 0) {
            arr = arr.sort(function (a, b) { return (a.Name > b.Name) ? 1 : ((b.Name > a.Name) ? -1 : 0); });
            arr = this.ordernaForm(arr);
            resolve(arr);
          } else {
            console.log("No such document!");
            resolve(null);
          }

        })
        .catch((error: any) => {
          reject(error);
        });
    });
  }

  ordernaForm(forms, Parent_key = null) {
    let ion = this;
    forms.forEach(function (form, i) {

      if (!('Parent_key' in form)) {
        forms = (ion.deleteParents(forms, form));
        ion.array.push(form);
        ion.ordernaForm(forms, form.$key);
      }

      if (form.Parent_key === Parent_key) {
        forms = (ion.deleteChildrens(forms, form));
        ion.array.push(form);
        if (form.Children_count > 0) {
          ion.ordernaForm(forms, form.$key);
        }
      }
    });
    if (Parent_key = ion.array) {
      return (ion.array);
    }
  }

  deleteParents(array, elem) {
    return array.filter(e => e.Level !== elem.Level);
  }
  deleteChildrens(array, elem) {
    return array.filter(e => e.Parent_key !== elem.Parent_key);
  }



  /*getAllDocuments(node = null): Promise<any> {
    return new Promise((resolve, reject) => {
      var citiesRef = this.db.collection("hierarchy_form");// Create a query against the collection.
      if (node == null){
        var query = citiesRef.where("Level", "==", '1');
      }
      else{
        var query = citiesRef.where("Parent_key", "==", node);
      }
  
        query
            .get()
            .then((querySnapshot) => {
                let arr = [];
                querySnapshot.forEach(function (doc) {
                    var obj = JSON.parse(JSON.stringify(doc.data()));
                    obj.$key = doc.id
                    arr.push(obj);
                });
  
                if (arr.length > 0) {
                    
                    arr.forEach(element => {
                      
                      if(element.Children_count >= 0){
                        console.log(this.array);
                       this.getAllDocuments(element.$key).then(res => {
                  
                        }).catch(err => {
        
                        })
                      }
                    });
                    resolve(arr);
                } else {
                    console.log("No such document!");
                    resolve(null);
                }
         
            })
            .catch((error: any) => {
                reject(error);
            });
    });
  }*/
}
