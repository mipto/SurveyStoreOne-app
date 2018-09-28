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
                objQuestion.$key = doc.id;
                
                ion.getFormAnswers(form.$key, doc.id)
                .then(answer => {
                  if(typeof(answer) === "boolean"){
                    objQuestion.na = answer;
                  } else {
                    objQuestion.answer = answer;
                  }
                  
                });
                if (!forms[i].questions.find(x => x.$key === objQuestion.$key)) {
                  forms[i].questions.push(objQuestion);
                }
            });
          });
        });
    });
    return (forms);
  }

  getFormAnswers(formID, questionID) {
    return new Promise((resolve, reject) => {
      console.log('entro en get answers');
      let ion = this;
      let hierarchiesAnswers = ion.db.collection("hierarchies_answers");

      hierarchiesAnswers.where("id_form", "==", formID)
          .where("id_question", "==", questionID).get()
          .then((snapShot) => {
            snapShot.forEach(function (doc) {
              let objAnswer = JSON.parse(JSON.stringify(doc.data()));
              objAnswer.$key = doc.id;

              // allForms[i].questions[i].answer = objAnswer.answer;

              console.log('objAnswer', objAnswer);
              if (objAnswer.na) {
                if (objAnswer.na == true) {
                  resolve(objAnswer.na);
                } else {
                  resolve(objAnswer.answer);
                }
              } else {
                resolve(objAnswer.answer);
              }
              
            });
          })
          .catch(err => {
            reject();
          })
    });
  }

  deleteParents(array, elem) {
    return array.filter(e => e.Level !== elem.Level);
  }
  deleteChildrens(array, elem) {
    return array.filter(e => e.Parent_key !== elem.Parent_key);
  }

  saveAllAnswers(Forms) {
    let ion = this;
    return new Promise((resolve, reject) => {
      let hierarchiesAnswers = ion.db.collection("hierarchies_answers");

      Forms.forEach(form => {
        form.questions.forEach(question => {
          let hasQuestion = question.answer ? true : false;
          let hasNa = typeof question.na !== 'undefined' ? true : false;
          let hasNaTrue = question.na == true ? true : false;
          let hasNaFalse = question.na == false ? true : false;
          
          if (hasQuestion) {
            ion.deleteOldAnswersBeforeSave(form.$key, question.$key).then(res => {
              hierarchiesAnswers.doc().set({
                id_form: form.$key,
                id_question: question.$key,
                answer: question.answer,
                na: false
              });
              console.log('answers saved sucess!');
            });
          } else if (hasNa) {
            if (hasNaTrue) {
              ion.deleteOldAnswersBeforeSave(form.$key, question.$key).then(res => {
                hierarchiesAnswers.doc().set({
                  id_form: form.$key,
                  id_question: question.$key,
                  answer: '',
                  na: true
                });
                console.log('answers saved sucess!');
              });
            } else if (hasNaFalse) {
              ion.deleteOldAnswersBeforeSave(form.$key, question.$key).then(res => {
                hierarchiesAnswers.doc().set({
                  id_form: form.$key,
                  id_question: question.$key,
                  answer: '',
                  na: false
                });
                console.log('answers saved sucess!');
              });
            }
          } else {
            console.log(' no answers saved!');
          }

        });
      });
      resolve();
    });
  }

  deleteOldAnswersBeforeSave(form, question){
    //ya funciona no tocar xD
    let ion = this;
    return new Promise(resolve => {
      let hierarchiesAnswers = ion.db.collection("hierarchies_answers");
      hierarchiesAnswers.where("id_form", "==", form)
      .where("id_question", "==", question).get()
      .then((snapShot) => {
        snapShot.forEach(function (doc) {
          hierarchiesAnswers.doc(doc.id).delete().then(function() {
            console.log("Document successfully deleted!");
            resolve();
          });
        });
        resolve();
      });
    });
  }
}
