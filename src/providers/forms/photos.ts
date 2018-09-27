import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import 'firebase/firestore';

@Injectable()
export class PhotosProvider {
    private fStorage: any;
    private db: any;
  
    constructor() {
      this.db = firebase.firestore();
      this.fStorage = firebase.storage();
    }

    uploadFormPictures(picsArray, idForm){
        let ion = this;
        picsArray.forEach(function (picture, i) {
          if (picture.image) {
            console.log('picture', picture, 'index', i);
          
            let randomString = Math.random().toString(36).replace(/[^a-z]+/g, '');
            let actualDate = new Date().getTime();
            let fileName = idForm + '-' + randomString + '-' + actualDate + '.jpg';
        
            ion.fStorage.ref('/forms_images/' + idForm).child(fileName)
            .putString(picture.image, 'base64', {contentType:'image/jpg'}).then(res =>{
                ion.fStorage.ref('/forms_images/' + idForm).child(fileName).getDownloadURL()
                .then(url => {
                ion.savePictureDB(url, idForm);
                })
                .catch(err => {
                console.log('cannot get url of picture');
                });
            });
          } else {
            if (picture.deleted) {
              console.log('delete this from db and storage', picture);
              ion.removePictureDB(picture);
            }
          }
          
        });
      }
    
      savePictureDB(url, idForm) {
        let ion = this;
        ion.db.collection('photos').doc().set({
          id_form: idForm,
          url: url
        });
      }

      removePictureDB(picture) {
        let ion = this;
        ion.db.collection('photos').doc(picture.$key).delete().then(function() {
            console.log("Document successfully deleted!");
            ion.removePictureStorage(picture);
        }).catch(function(error) {
            console.error("Error removing document: ", error);
        });
        
      }

      removePictureStorage(picture) {
        let ion = this;
        let picReference = ion.fStorage.refFromURL(picture.src);
        picReference.delete().then(function() {
            console.log('picture removed successfully');
          }).catch(function(error) {
            console.log('ups.... pictured cannot be removed.');
          });
      }
    
      getFormPictures(idForm) {
        let ion = this;
        let photos = ion.db.collection("photos");
        let gettedPics = [];
        return new Promise((resolve, reject) => {
          photos.where("id_form", "==", idForm).get()
            .then((snapShot) => {
              snapShot.forEach(function (doc) {
                let objPicture = JSON.parse(JSON.stringify(doc.data()));
                objPicture.$key = doc.id;
                gettedPics.push(objPicture);
              });
              resolve(gettedPics);
            })
            .catch(err => {
              console.log('cannot get pictures :(', err);
              reject(err);
            });
    
        });
      }
}