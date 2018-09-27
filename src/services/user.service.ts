import { Injectable } from '@angular/core';
@Injectable()
export class UserService {
    public user: any = {
        id: '',
        email: '',
        uid: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: '',
        photo: '',
        sex: '',
        position: '',
        country: '',
        city: '',
        birthday: '',
        last_connection: ''
    }
}
