import { Component, ViewChild  } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController , ToastController, Select } from 'ionic-angular';
import { FormsProvider } from '../../../providers/forms/forms';
import { Storage } from '@ionic/storage';
import { Network } from '@ionic-native/network';
import { Globals } from '../../../services/globals.service';


@IonicPage()
@Component({
  selector: 'page-forms',
  templateUrl: 'forms.html',
})
export class FormsPage {
  public forms: any;
  public search: any;
  public idEntity: any;
  public idForm: any;
  public nameForm: any;
  public statusForm: any;
  public allForms: any;
  public formIndex: any;
  public formsConstraint: any;
  public changeForm: any;
  public scrollSelect: any;
  public sync: boolean;
  
  public loadingForm: any;
  public showQuestion = false;
  public parentKeyList = [];
  public arrayFamily = [];
  @ViewChild('mySelect') selectRef: Select;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public FormsProvider: FormsProvider,
    public alertCtrl: AlertController,
    public storage: Storage,
    public loadingCtrl: LoadingController,
    public globals: Globals,
    public network: Network,
    private toastCtrl: ToastController) {

    let data = navParams.get('data');
    this.idForm = data.idForm;
    this.nameForm = data.nameForm;
    this.statusForm = data.statusForm;
    this.idEntity = data.idEntity;
    this.sync = false;
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
    console.log('Formulario: ',this.forms);

    if(this.isOnDevice())
    {
      if(this.isOnline())
      {
        //Parte online
        ion.saveAllAnswersOnline() 
        
      }else
      {
        //Offline (ver si se guardaron bien los cambios en el storage)
        console.log("offline");
        
        ion.saveAllAnswersOffline()  
              
      }
    }else{
      //Offline (ver si se guardaron bien los cambios en el storage)
      //ion.saveAllAnswersOffline()  
      //ion.saveAllAnswersOnConnect()
      
      //Parte online
      ion.saveAllAnswersOnline() 
      

    }
  }

  saveAllAnswersOnConnect()
  {
    //Promise.all([this.storage.set('changeForms')])
    console.log(this.changeForm);

      for (let ii = 0; ii < this.changeForm.length; ii++) {
        const element = this.changeForm[ii].$key;
        console.log(this.allForms[element]);
        console.log(this.forms);
        
        this.FormsProvider.saveAllAnswers(this.allForms[element], this.idEntity, false).then(res => {
          // console.log('va a guardar');
          this.forms = null;
    
          this.FormsProvider.getFormUserByFormID(this.idForm).then(userForm => {
            let form: any;
            form = userForm;
            if (form.status == 1) {
              this.FormsProvider.updateFormStatus(this.idForm, 2).then(res => {
                // console.log('updated form status.');
                
              })
            } else {
              // console.log('form is already draft.');
              
            }
          })
        })
        
      }
    
  }
  saveAllAnswersOnline() {
    let ion = this
    //if status == 2
    this.saveAllAnswersOffline()
    //this.FormsProvider.saveArrAnswers(ion.forms)
    this.FormsProvider.saveAllAnswers(ion.forms, this.idEntity, this.sync).then(res => {
      // console.log('va a guardar');
      this.forms = null;

      this.FormsProvider.getFormUserByFormID(ion.idForm).then(userForm => {
        let form: any;
        form = userForm;
        if (form.status == 1) {
          this.FormsProvider.updateFormStatus(ion.idForm, 2).then(res => {
            // console.log('updated form status.');
            
          })
        } else {
          // console.log('form is already draft.');
          
        }
      })
    })
  
  }
  saveAllAnswersOffline() {
    let arr = []
    this.allForms[this.formIndex] = this.forms
    //this.allForms[this.formIndex].change = true
   
    console.log(this.changeForm);
    
    this.storage.set('changeForms',  this.changeForm)

    // console.log(this.allForms);
    this.storage.set('allFormsQA', this.allForms)
  }

  isOnline(): boolean {
    return  this.network.type !== 'none'
  }
  
  isOnDevice():boolean {
    return this.network.type !== null
  }

  getForms() {
    let ion = this;
    if(this.isOnDevice())
    {
      if (this.isOnline() && this.statusForm === 1) {
      //Versión online
      this.getDocumentsOnline()
    
    } else {
      //Versión offline
      this.getDocumentsOffline()
        
      }
    } else
    {
        this.getDocumentsOnline()
        //this.getDocumentsOffline()

    }
    
  }
  anyError(){
    console.log(this.forms.question);
    
  }
  getDocumentsOffline() {
   let ion= this
    this.storage.get('allFormsQA').then(all =>{
      this.allForms = all;
      // console.log(this.allForms.filter(k => k[0].Id_form === this.idForm)[0]);
      this.formIndex = all.findIndex(k => k[0].Id_form === this.idForm)
      
       this.forms =all.filter(k => k[0].Id_form === this.idForm)[0];
      // console.log(this.forms);
      this.storage.get('changeForms').then(form =>{
        // console.log(form);
        
        this.changeForm = form;
        let formC = {
          $key: this.formIndex,
          id_form: this.idForm,
          id_entity: this.idEntity,
          sync: false
        }
        console.log(formC);
        //debugger
        if(this.changeForm !== undefined && this.changeForm !== null)
        {
          console.log(this.changeForm);
          
          // arr = this.changeForm
          if ( this.changeForm.find(k => k.$key === this.formIndex) === undefined) {
            this.changeForm.push(formC)
          }
        }else{
          // console.log('vaciooo ',this.changeForm);
          this.changeForm = []
          this.changeForm.push(formC)

         // this.storage.set('changeForms', [])

        }
      })
      ion.loadingForm.dismiss();
      ion.createArrayFamiliar();
    }).catch(e=>{
      console.log(e);
      
    })
  }
  getDocumentsOnline() {
    let ion = this;
    this.FormsProvider.getAllDocuments(this.idForm).then(docs => {
      this.forms = docs;
      console.log('orderder forms', this.forms);

      this.storage.get('allFormsQA').then(all =>{
        this.allForms = all;
        this.formIndex = all.findIndex(k => k[0].Id_form === this.idForm)
      }).catch((err)=>{
        console.log(err);
        
      });
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
    if(!this.validForm()){
      this.toastCtrl.create({
        message: this.globals.LANG.SINC_ERROR,
        duration: 3000
      }).present();
      console.log('error o vacío');
    }else{
      this.sincronizeConfirm();

    }
    
  }
  validForm() {
    let valid=true
   
    for (let ii = 0; ii < this.forms.length; ii++) {
      const form = this.forms[ii];
      for (let jj = 0; jj < form.questions.length; jj++) {
        const question = form.questions[jj];
        if (!question.na) {
          if((question.type == 3 || question.type == 4) &&
            question.otherOption &&
            this.answerEmpty(question.otherAnswer))
          {
            valid = false
            break;
          }
          if(this.answerEmpty(question.answer) && !question.na)
          {
            valid = false
            break;
          }        
          if(question.type == 1 && this.valideInput(question.answer, 'number', question.max_value, question.min_value) == 1)
            {
              valid = false
              break;
            }
        } 
      }
    }
    return valid
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

            if(this.isOnDevice())
            {
              if(this.isOnline())
              {
                //Online
                this.FormsProvider.updateFormStatus(this.idForm, 3).then(res => {
                console.log('updated form status.');
                this.sync = true;
                this.navCtrl.pop(); 
              })  
              }else
              {
                //Offline
                // this.storage.get('allForms').then( all => {
                //   let auxInd = all.findIndex(k => k.$key === this.idForm)
                //   all[auxInd].userStatus = 3
                // })

              }

            }
            else{
              //Offline
              this.storage.get('allForms').then( all => {
                let auxInd = all.findIndex(k => k.$key === this.idForm);
                all[auxInd].userStatus = 3;

              })
              let aux;
              debugger
              this.storage.get('allFormsQA').then(all => {
                aux = all.filter(k => k[0].Id_form !== this.idForm);
                console.log(aux);
                debugger
                this.storage.set('allFormsQA', aux);
              })
              //Online
              //se agrega un nuevo campo, es la fecha actual
              this.FormsProvider.updateFormStatus(this.idForm, 3).then(res => {
                console.log('updated form status.');
                this.sync = true;

                this.navCtrl.pop(); 
                
              })

            }
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
          //console.log(element);
          
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
    greaterThan8(n)
    {
      return Number(n) >= 8;
    }
    answerEmpty(answer)
    {
      // console.log(answer);
      
      return (answer ===  '') || (answer ===  null) || (answer ===  undefined)
    }
    valideInput(evento,  typeInput, max, min)
    {
        //console.log(' estoy escribiendo esto', evento);
     
        if (typeInput == 'number') {
          let re = new RegExp("^([0-9])*$");
          if (re.test(evento)) {
            if ((max == null || (Number(evento) <= max))
            && (min == null || (Number(evento) >= min))) {
              // console.log("Valid");
              return 0;
            }else
            {
              // console.log("Invalid ", evento);
              return 1;

            }
              //lo dejo apsar
          } else {
              // console.log("Invalid");
              return 1;
              //mostrar mensaje al usuario de que lo que introdujo es invalido
              //alert('Introduce solo numeros del 1-9');
          }
        } else if (typeInput == 'text') {
          let re = new RegExp("^([a-z0-9]{5,})$");
          if (re.test(evento)) {
              // console.log("Valid");
              //lo dejo apsar
          } else {
              // console.log("Invalid");
              //mostrar mensaje al usuario de que lo que introdujo es invalido
              //alert('Introduce solo numeros del 1-9');
          }
        }
    
    }
    onChange(answer)
    {
      // console.log("evento select ",answer);
      //return true
      if (answer == this.globals.LANG.OTHER || answer == "") {
        // console.log("Other select");
        return true;
      }
      return false;
    }
}
