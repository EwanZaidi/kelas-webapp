import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  err;

  constructor(public authService: AuthService, private router : Router) { }

  ngOnInit() {
  }

  login(loginForm){
    let email = loginForm.value.email;
    let password = loginForm.value.password;

    this.err = this.authService.login(email, password);
    console.log(this.err);
  }

  loginPage(){
    this.router.navigate(['/login']);
  }

  reset(){
    this.router.navigate(['/resetpassword'])
  }

  signUp(){
    this.router.navigate(['/register'])
  }
}
