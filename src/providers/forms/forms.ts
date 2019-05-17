import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http'
import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import 'firebase/firestore';
import { AuthData } from '../../providers/auth-data';
import { CardsProvider } from "../../providers/forms/cards-list";
import { Storage } from '@ionic/storage';

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

  constructor(private http: HttpClient, public authData: AuthData, public cardsProvider:CardsProvider, public storage: Storage) {
    this.db = firebase.firestore();
    this.array = [];
  }

  getAllDocumentPendient(idForm): Promise<any>{
    return new Promise((resolve, reject) => {
        this.storage.get('allFormsQA').then(sd=>{
          console.log(sd);
          resolve(sd.filter(k => k[0].Id_form === idForm)[0])
          
      }).catch(e=>{
        console.log(e);
        reject(e);
      })

    })
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
            
            this.ordernaForm(arr).then(result => {
              this.array = [];
              resolve(result);
            });
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
    return new Promise((resolve, reject) => {
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
        ion.getFormQuestions(ion.array).then(result => {
          ion.array = result;
          resolve(ion.array);
        });
        
      }
    });
  }

  getFormQuestions(forms) {
    return new Promise((resolve, reject) => {
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
                objQuestion.error = 0;
                if(objQuestion.type === 3 || objQuestion.type === 4)
                {
                  ion.getFormSelectAnswers(form.$key, doc.id)
                  .then(answer => {
                    if(typeof(answer) === "boolean"){
                      objQuestion.na = answer;
                    } else {
                      // objQuestion.answer = answer;
                      // console.log(answer);
                      
                      objQuestion.answer = answer[0];
                      objQuestion.otherOption = answer[1];
                      objQuestion.otherAnswer = answer[2];
                    }
                  });

                }
                else{
                  //buscar respuestas una a una
                  ion.getFormAnswers(form.$key, doc.id)
                  .then(answer => {
                    if(typeof(answer) === "boolean"){
                      objQuestion.na = answer;
                    } else {
                      objQuestion.answer = answer;
                      //console.log(answer);
                      
                      // objQuestion.answer = answer[0];
                      // objQuestion.otherOption = answer[1];
                    }
                  });
                }



                if (!forms[i].questions.find(x => x.$key === objQuestion.$key)) {
                  forms[i].questions.push(objQuestion);
                }
            });
          });
        });
    });
    resolve(forms);
    });
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
              //console.log('eaee');
              
              //console.log('objAnswer', objAnswer);
              if (objAnswer.na) {
                if (objAnswer.na == true) {
                  resolve(objAnswer.na);
                } else {
                  resolve(objAnswer.answer);
                  // resolve([objAnswer.answer, objAnswer.otherOption]);

                }
              } else {
                resolve(objAnswer.answer);
                // resolve([objAnswer.answer, objAnswer.otherOption]);
              }
              
            });
          })
          .catch(err => {
            reject();
          })
    });
  }
  getFormSelectAnswers(formID, questionID) {
    // console.log('select answer');
    
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
              if(objAnswer.otherOption === undefined || objAnswer.otherOption === null)
                objAnswer.otherOption = true;
              if(objAnswer.otherAnswer === undefined || objAnswer.otherAnswer === null)
                objAnswer.otherAnswer = '';

              // allForms[i].questions[i].answer = objAnswer.answer;

              console.log('objAnswer', objAnswer);
              if (objAnswer.na) {
                if (objAnswer.na == true) {
                  resolve(objAnswer.na);
                } else {
                  // resolve(objAnswer.answer);
                  resolve([objAnswer.answer, objAnswer.otherOption, objAnswer.otherAnswer]);

                }
              } else {
                // resolve(objAnswer.answer);
                resolve([objAnswer.answer, objAnswer.otherOption, objAnswer.otherAnswer]);
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
      ion.deleteOldAnswersArrayBeforeSave().then(ans =>{

        hierarchiesAnswers.doc().set({
          id_form:'123123',
          answers: [{asd: 'ss', sss: 'www'},{asd: 'ss', sss: 'www'},{asd: 'ss', sss: 'www'}]
  
        })
        console.log('answers saved sucess!');

      })
      Forms.forEach(form => {
        form.questions.forEach(question => {
          let hasQuestion = question.answer ? true : false;
          let hasNa = typeof question.na !== 'undefined' ? true : false;
          let hasNaTrue = question.na == true ? true : false;
          let hasNaFalse = question.na == false ? true : false;
          let hasOtherOption = typeof question.otherOption !== 'undefined' ? true : false;
          let hasOtherOptionTrue = question.otherOption == true ? true : false;
          let hasOtherOptionFalse = question.otherOption == false ? true : false;
          let otherBool

          if (hasOtherOption) {
            otherBool = question.otherOption
            if(hasOtherOptionFalse)
              question.otherAnswer = '' 
          }
            // else {
          //   console.log(question.otherOption)
          //   otherBool = false
            
          // }
          console.log(question.otherOption)
        if (hasQuestion) {
          //hay que cambiar cosas de aquí agregar el other option if con question.type
          if(question.type === 3 || question.type === 4){
            if (hasNa && hasNaTrue) {
              ion.deleteOldAnswersBeforeSave(form.$key, question.$key).then(res => {
                hierarchiesAnswers.doc().set({
                  id_form: form.$key,
                  id_question: question.$key,
                  answer: '',
                  otherAnswer: '',
                  otherOption: false,
                  na: true
                });
                console.log('answers saved sucess!');
              });
            } else {
              ion.deleteOldAnswersBeforeSave(form.$key, question.$key).then(res => {
                hierarchiesAnswers.doc().set({
                  id_form: form.$key,
                  id_question: question.$key,
                  answer: question.answer,
                  otherAnswer: question.otherAnswer,
                  otherOption: otherBool,
                  na: false
                });
                console.log('answers saved sucess!');
            });
            }
            
          }else{
            if (hasNa && hasNaTrue) {
              ion.deleteOldAnswersBeforeSave(form.$key, question.$key).then(res => {
                hierarchiesAnswers.doc().set({
                  id_form: form.$key,
                  id_question: question.$key,
                  answer: '',
                  // otherOption: otherBool,
                  na: true
                });
                console.log('answers saved sucess!');
              });
            } else {
              ion.deleteOldAnswersBeforeSave(form.$key, question.$key).then(res => {
                hierarchiesAnswers.doc().set({
                  id_form: form.$key,
                  id_question: question.$key,
                  answer: question.answer,
                  // otherOption: otherBool,
                  na: false
                });
                console.log('answers saved sucess!');
            });
            } 

          }
        } else if (hasNa) {
          if(question.type === 3 || question.type === 4){
            if (hasNaTrue) {
              ion.deleteOldAnswersBeforeSave(form.$key, question.$key).then(res => {
                hierarchiesAnswers.doc().set({
                  id_form: form.$key,
                  id_question: question.$key,
                  otherOption: false,
                  answer: '',
                  otherAnswer: '',
                  na: true
                });
                console.log('answers saved sucess!');
              });
            } else if (hasNaFalse) {
              ion.deleteOldAnswersBeforeSave(form.$key, question.$key).then(res => {
                hierarchiesAnswers.doc().set({
                  id_form: form.$key,
                  id_question: question.$key,
                  otherOption: false,
                  answer: '',
                  otherAnswer: '',
                  na: false
                });
                console.log('answers saved sucess!');
              });
            }
          }else{

            if (hasNaTrue) {
              ion.deleteOldAnswersBeforeSave(form.$key, question.$key).then(res => {
                hierarchiesAnswers.doc().set({
                  id_form: form.$key,
                  id_question: question.$key,
                  // otherOption: otherBool,
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
                  // otherOption: otherBool,
                  answer: '',
                  na: false
                });
                console.log('answers saved sucess!');
              });
            }
          }
        } else {
          console.log(' no answers saved!');
        }

        });
      });
      resolve();
    });
  }
  deleteOldAnswersArrayBeforeSave()
  {
    let ion = this
    return new Promise (resolve =>{
      let hierarchiesAnswers = ion.db.collection("hierarchies_answers");
      hierarchiesAnswers.where("id_form", "==", '123123')
      .get()
      .then((snapShot) => {
        snapShot.forEach(function (doc) {
          hierarchiesAnswers.doc(doc.id).delete().then(function() {
            console.log("Document successfully deleted!");
            resolve();
          });
        });
        resolve();
      });
    })
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

  getFormUserByFormID(idForm){
    return new Promise((resolve, reject) => {
      let ion = this;
      let authUser = ion.authData.getAuthUser();
        let forms_users = this.db.collection("forms_users");
        forms_users.where("id_user", "==", authUser.uid)
        .where("id_form", "==", idForm)
        .get()
        .then(querySnapshot => {
          querySnapshot.forEach(doc => {
            let formUser = doc.data();
            formUser.$key = doc.id;
            resolve(formUser);
         });
        })
        .catch(err => {
          console.log('doc form not found.');
          reject(err);
        });
    });
  }

  updateFormStatus(idForm, userStatus) {
    return new Promise((resolve, reject) => {
      let ion = this;
      ion.getFormUserByFormID(idForm).then(userForm => {
        let formRes: any;
        formRes = userForm;
         this.db.collection("forms_users").doc(formRes.$key).update({status: userStatus}).then(result => {
          resolve();
        });
      })
      .catch(err => {
        console.log('document not found.');
        reject(err);
      })
      
    });
  }

  //Función de sincronizar para obtener TODOS los formularios de un usuario
  getFormByUser(){
    return new Promise((resolve, reject) => {
      let ion = this;
      let authUser = ion.authData.getAuthUser();
        let forms_users = this.db.collection("forms_users");
        forms_users.where("id_user", "==", authUser.uid)
        .get()
        .then(querySnapshot => {
          querySnapshot.forEach(doc => {
            let formUser = doc.data();
            formUser.$key = doc.id;
            resolve(formUser);
         });
        })
        .catch(err => {
          console.log('doc form not found.');
          reject(err);
        });
    });
  }

  getAllDocumentsForAllForms(AllFormId){
    return new Promise((resolve,reject) =>{
      let ion = this;
      let allForms = [];
      let authUser = ion.authData.getAuthUser();
        //console.log(AllFormId);
        var itemsProcessed = 0;
        AllFormId.forEach(element => {
          //console.log(element.$key);
          itemsProcessed++
          if(element.status == 1)
          {
            ion.getAllDocuments(element.$key).then(doc =>{
              //+console.log(doc);
              if(doc !== null)
              {
                //doc.$key = element.$key
                allForms.push(doc);

              }/*else{
                let doN;
                doN.$key = element.$key
                doN = 0
                allForms.push(doN);

              }*/
              if(itemsProcessed == AllFormId.length && allForms.length > 0)
              {
                //console.log(allForms);
                
                resolve(allForms)
              }
            })
          }else if(element.status == 2)
          {
            ion.getAllDocumentPendient(element.$key).then(doc =>{
              console.log(doc);
              if(doc !== null)
              {
                //doc.$key = element.$key
                allForms.push(doc);

              }/*else{
                let doN;
                doN.$key = element.$key
                doN = 0
                allForms.push(doN);

              }*/
              if(itemsProcessed == AllFormId.length && allForms.length > 0)
              {
                //console.log(allForms);
                
                resolve(allForms)
              }
            })
          }
        });
        
      
    })
  }
}
