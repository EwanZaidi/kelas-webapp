import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.css']
})
export class ForgotpasswordComponent implements OnInit {

  error:any;
  successmsg:any;

  constructor(private auth: AngularFireAuth, private router:Router) { }

  ngOnInit() {
  }

  forgot(forgotForm){
    firebase.auth().sendPasswordResetEmail(forgotForm.value.email).then(value => {
      this.successmsg = "Email has been send to your email for reset password, please login with your new password"
      setTimeout((router: Router) => {
        this.router.navigate(['/login']);
      }, 3000);  
    }).catch(err => {
      this.error = err;
      setTimeout((router: Router) => {
        this.error = null;
      }, 3000);  
    })
  }


}
