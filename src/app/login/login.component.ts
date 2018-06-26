import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase';
import { AngularFireDatabase } from 'angularfire2/database';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  err;
  uid: any;

  constructor(public authService: AuthService, private router: Router, private afAuth: AngularFireAuth, private db: AngularFireDatabase) { }

  ngOnInit() {
  }

  login(loginForm) {
    let email = loginForm.value.email;
    let password = loginForm.value.password;

    this.err = this.authService.login(email, password);
    console.log(this.err);
  }

  loginPage() {
    this.router.navigate(['/login']);
  }

  reset() {
    this.router.navigate(['/resetpassword'])
  }

  signUp() {
    this.router.navigate(['/register'])
  }

  loginGoogle() {
    this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(
      value => {
        this.afAuth.authState.subscribe(user => {
          if (user) {
            this.uid = user.uid;
          }
          this.db.object('users/' + this.uid).set({
            about: 'Hey, im new user at Kelas App',
            display_name: 'New User',
            email: user.email,
            full_name: user.displayName,
            image_url: 'https://firebasestorage.googleapis.com/v0/b/kelas-dev.appspot.com/o/default.png?alt=media&token=64fce9a8-a932-415b-b3e8-d159793b23ed',
            title: 'My Title',
          })
          this.db.object('preferences/' + this.uid).set({
            assignment: false,
            discussion: false,
            meeting: false
          })
          this.router.navigate(['/starterview'])
        })
        return null;
      }).catch(
        (err) => {
          this.err = err;
      })
  }
}
