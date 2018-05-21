import { Injectable } from '@angular/core';

import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import { AngularFireDatabase } from 'angularfire2/database';

@Injectable()

export class AuthService{
    user: Observable<firebase.User>
    errorMessage : any;

    uid;

    constructor(private firebaseAuth: AngularFireAuth, private router: Router, private db:AngularFireDatabase) {
        this.user = firebaseAuth.authState;
    }

    signup(email: string, password: string, name:string) {
       return this.firebaseAuth
            .auth
            .createUserWithEmailAndPassword(email, password)
            .then(value => {
                this.firebaseAuth.authState.subscribe(user =>{
                    if(user){
                        this.uid = user.uid;
                    }
                    this.db.object('users/'+this.uid).set({
                       about: 'Hey, im new user at Kelas App',
                       display_name: 'New User',
                       email: user.email,
                       full_name: name,
                       image_url: 'https://firebasestorage.googleapis.com/v0/b/kelas-dev.appspot.com/o/default.png?alt=media&token=64fce9a8-a932-415b-b3e8-d159793b23ed',
                       title: 'My Title',
                    })
                    this.db.object('preferences/'+this.uid).set({
                        assignment: false,
                        discussion: false,
                        meeting: false
                    })
                    this.router.navigate(['/starterview'])
                })
                return null;
            })
            .catch(err => {
                console.log('Something went wrong:', err.message);
                return err.message
            });
    }

    login(email: string, password: string) {
        this.firebaseAuth
            .auth
            .signInWithEmailAndPassword(email, password)
            .then(value => {
                console.log('Nice, it worked!');
                this.router.navigate(['/starterview'])
            })
            .catch(err => {
                this.errorMessage = err;
                return this.errorMessage;
                // this.errorMessage = err;
                // this.error = true;
                // console.log('Something went wrong:', err.message);
            });
    }

    logout() {
        this.firebaseAuth
            .auth
            .signOut()
            .then(x => {
                this.router.navigate(['/login'])
            })
    }
}

