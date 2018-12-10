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
  public showQuestion = false;
  public parentKeyList = [];
  public arrayFamily = [];
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
      ion.createArrayFamiliar();
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
    createArrayFamiliar(){
      for (const key in this.forms) {
        if (this.forms.hasOwnProperty(key)) {
          const element = this.forms[key];
          let obj = {};
          let id = element.$key;
          //si form es level 1 NO tiene 
          if (element.Level === "1") {
            obj = {}
            obj["form_id"] = id;
            obj["ancestro"] = '';

          }
          else{
            let actualLevel = element.Level;
            let actualKey = element.Parent_key;
            while(actualLevel != "2")
            {
              const resultado = this.forms.find( form => form.$key === actualKey );
              if (resultado != undefined) {
                actualLevel = resultado.Level;
                actualKey = resultado.Parent_key;
              }
            }
            obj["form_id"] = id;
            obj["ancestro"] = actualKey;
          }
          this.arrayFamily.push(obj)

        }
      }
    }
    changeStateShowQ(parentKey){
      
      let findA = this.arrayFamily.find(k => k.form_id === parentKey);
      let findP = this.parentKeyList.find(k => k === parentKey);

      if (findP === undefined && findA.ancestro === '') {
        this.parentKeyList.push(parentKey);
      }else if(findA.ancestro === ''){
        this.parentKeyList = this.parentKeyList.filter(obj => obj != parentKey);
      }
    }
    activeParent(key){
      //let findP = this.parentKeyList.find(k => k === parentKey);
      let findA = this.arrayFamily.find(k => k.form_id === key);
      let findP = this.parentKeyList.find(k => k === findA.ancestro);
      
      if (findP === undefined) {
        return false;
        
      }else{
        return true;
      }
    }

    isAdd(key){
      let findP = this.parentKeyList.find(k => k === key);
      if (findP === undefined) {
        return true;
        
      }else{
        return false;
      }
    }
  
}
