import { Component, OnInit } from '@angular/core';
import {NgForm} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { AngularFireDatabase } from 'angularfire2/database';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  name : any = '';
  password : any = '';
  email : any = '';

  page1:Boolean = true;
  page2: Boolean = false;

  student:Boolean = false;
  teacher: Boolean = false;
  parents:Boolean = false;

  roles: any;
  school: any;
  err:any;

  constructor(private router:Router, private authService:AuthService, private db: AngularFireDatabase) { }

  ngOnInit() {
  }

  submit(page1:NgForm){
    this.name = page1.value.name;
    this.password = page1.value.password;
    this.email = page1.value.email;

    this.err = this.authService.signup(this.email,this.password, this.name)
    console.log(this.err);
  }

  submitPage2(page2:NgForm){
    this.school = page2.value.school;
  }

  back(){
    this.page1 = true;
    this.page2 = false;
  }

  loginPage(){
    this.router.navigate(['/login']);
  }

  role(event:any){
    if(event=='parents'){
      this.parents = true;
      this.student = false;
      this.teacher = false;
    }else if(event=='student'){
      this.parents = false;
      this.student = true;
      this.teacher = false;
    }else{
      this.parents = false;
      this.student = false;
      this.teacher = true;
    }
    this.roles = event;
  }
}
