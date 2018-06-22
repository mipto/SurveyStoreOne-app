import { Injectable } from '@angular/core';
@Injectable()
export class Helpers {
  constructor() {
  }

checkNavigatorLanguage() {
    if (navigator.language) {
        return navigator.language;
    } else {
        return 'en';
    }
}

}

