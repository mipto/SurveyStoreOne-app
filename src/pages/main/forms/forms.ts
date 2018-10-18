import { Component, ViewChild  } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController , ToastController, Select } from 'ionic-angular';
import { FormsProvider } from '../../../providers/forms/forms';


@IonicPage()
@Component({
  selector: 'page-forms',
  templateUrl: 'forms.html',
})
export class FormsPage {
  public forms: any;
  public idForm: any;
  public nameForm: any;

  public scrollSelect: any;

  public loadingForm: any;
  @ViewChild('mySelect') selectRef: Select;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public FormsProvider: FormsProvider,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private toastCtrl: ToastController) {

    let data = navParams.get('data');
    this.idForm = data.idForm;
    this.nameForm = data.nameForm;

  }

  ionViewWillEnter(){
    let ion = this;
    ion.loadingForm = ion.loadingCtrl.create({
      spinner: 'crescent', 
      content: ''
    });
    ion.loadingForm.present();
    ion.getForms();
  }
  ionViewWillLeave(){
    let ion = this;
    console.log(this.forms);

    this.FormsProvider.saveAllAnswers(ion.forms).then(res => {
      console.log('va a guardar');
      this.forms = null;

      this.FormsProvider.getFormUserByFormID(ion.idForm).then(userForm => {
        let form: any;
        form = userForm;
        if (form.status == 1) {
          this.FormsProvider.updateFormStatus(ion.idForm, 2).then(res => {
            console.log('updated form status.');
            
          })
        } else {
          console.log('form is already draft.');
          
        }
      })
    })
    
  }

  getForms() {
    let ion = this;
    this.FormsProvider.getAllDocuments(this.idForm).then(docs => {
      this.forms = docs;
      console.log('orderder forms', this.forms);
      ion.loadingForm.dismiss();
    })
  }

  goPhotos() {
    let ion = this;
    
    ion.navCtrl.push('PhotosPage', {
      data: {
        idForm: this.idForm
      }
    });
  }

  sincronizeForm(){
    console.log('sincronize enter');
    this.sincronizeConfirm();
  }

  sincronizeConfirm() {
    let alert = this.alertCtrl.create({
      title: 'Sincronize',
      message: 'Are you sure you want to sincronize this form?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Canceled Sincronize');
          }
        },
        {
          text: 'Sincronize',
          handler: () => {
            console.log('Sincronized clicked');
            this.FormsProvider.updateFormStatus(this.idForm, 3).then(res => {
              console.log('updated form status.');
              
            })
          }
        }
      ]
    });
    alert.present();
  }

  openSelect()
    {
        this.selectRef.open();
    }

    scrollToEl(id) {
      console.log(`scrolling to ${id}`);
      let el = document.getElementById(id);
      el.scrollIntoView();
    }
  
}
