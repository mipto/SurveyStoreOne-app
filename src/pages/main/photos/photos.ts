import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {Camera} from '@ionic-native/camera';
import { PhotosProvider } from '../../../providers/forms/photos';


@IonicPage()
@Component({
  selector: 'page-photos',
  templateUrl: 'photos.html',
    providers: [[Camera]]
})
export class PhotosPage {

  public photos: any = [];
  public idForm: any;
  public unOrderedPics: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, private camera: Camera, public PhotosProvider: PhotosProvider) {
    let data = navParams.get('data');
    this.idForm = data.idForm;
  }

  ionViewWillEnter(){
    let ion = this;
    ion.PhotosProvider.getFormPictures(ion.idForm)
    .then(pics => {
      ion.unOrderedPics = pics;
      ion.orderGettedPics();
      
      
    });
  }
  ionViewWillLeave(){
    let ion = this;
    ion.PhotosProvider.uploadFormPictures(ion.photos, ion.idForm);
  }

  orderGettedPics() {
    let ion = this;
    console.log('picssss unorderd',ion.unOrderedPics);
    
    ion.unOrderedPics.forEach(pic => {
      let myPicture = {
        $key: pic.$key,
        src: pic.url
      }
      ion.photos.push(myPicture);
    });
  }

  takePicture(){
    this.camera.getPicture({
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
      
    }).then((imageData) => {
        let myPicture = {
          image: imageData,
          src: "data:image/jpeg;base64," + imageData
        }
        this.photos.push(myPicture); 
        console.log('pictures', this.photos);
        
    }, (err) => {
        console.log(err);
    });
  }

  deletePicture(photo) {
    let photoIndex = this.photos.indexOf(photo);
    this.photos[photoIndex].deleted = true;
  }
  
}
