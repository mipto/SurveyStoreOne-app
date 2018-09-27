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

  getAllDocuments(idForm): Promise<any> {

    return new Promise((resolve, reject) => {
      var forms = this.db.collection("hierarchy_form")
      .where("Id_form", "==", idForm)// Create a query against the collection.

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
            this.array = [];
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
      ion.array = ion.getFormQuestions(ion.array);
      return (ion.array);
    }
  }

  getFormQuestions(forms) {
    let ion = this;
    let hierarchiesQuestions = ion.db.collection("hierarchies_questions");
    var questions = ion.db.collection("questions");
    forms.forEach(function (form, i) {
      forms[i].questions = [];
      hierarchiesQuestions.where("Id_hierarchy_form", "==", form.$key).get()
        .then((snapShot) => {
          snapShot.forEach(function (doc) {
            let objQuestion = JSON.parse(JSON.stringify(doc.data()));
            objQuestion.$key = doc.id;

            questions.doc(objQuestion.Id_question).get()
            .then(function(doc) {
                var objQuestion = JSON.parse(JSON.stringify(doc.data()));
                objQuestion.$key = doc.id

                if (!forms[i].questions.find(x => x.$key === objQuestion.$key)) {
                  forms[i].questions.push(objQuestion);
                }
                
            });
          });
        });
    });
    return forms
  }

  deleteParents(array, elem) {
    return array.filter(e => e.Level !== elem.Level);
  }
  deleteChildrens(array, elem) {
    return array.filter(e => e.Parent_key !== elem.Parent_key);
  }
}
