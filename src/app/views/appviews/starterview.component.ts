import { Component, OnDestroy, OnInit, } from '@angular/core';
import { AngularFireDatabase, AngularFireObject, AngularFireList } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import { NgForm } from '@angular/forms';
import * as firebase from 'firebase';
import { DashboardService } from '../../service/dashboard.service';

@Component({
  selector: 'starter',
  templateUrl: 'starter.template.html'
})
export class StarterViewComponent implements OnDestroy, OnInit {

  public nav: any;
  user_id: any;

  user: AngularFireObject<any>;
  user$: Observable<any>;

  courses: AngularFireList<any>;
  course: Observable<any>;

  dashboard: AngularFireList<any>;
  dash: Observable<any>;

  selected_group = 'Select Group';
  key;

  file:any;

  success = null;

  constructor(private db: AngularFireDatabase, private afAuth: AngularFireAuth, private dbSvc: DashboardService) {
    this.nav = document.querySelector('nav.navbar');

    this.afAuth.authState.subscribe((auth) => {
      if (auth) {
        this.user_id = auth.uid;

        this.user = this.db.object('users/' + auth.uid);
        this.user$ = this.user.valueChanges();

        this.courses = this.db.list('courses/course_list', ref => ref.orderByChild('created_by').equalTo(auth.uid));
        this.course = this.courses.snapshotChanges().map(c => {
          return c.map(cour => {
            const data = cour.payload.val();
            const key = cour.payload.key;

            return { data, key }
          })
        });

        this.dashboard = this.db.list('dashboard/', ref => ref.orderByChild('created_by').equalTo(auth.uid));
        this.dash = this.dashboard.snapshotChanges().map((d) => {
          return d.map(db => {
            const data = db.payload.val();
            const key = db.payload.key;

            return {data,key}
          })
        })
      }
    })

  }

  selectGroup(key) {
    this.key = key;
  }

  public ngOnInit(): any {
    this.nav.className += " white-bg";
  }


  public ngOnDestroy(): any {
    this.nav.classList.remove("white-bg");
  }

  newStory(form) {
    // firebase.database().ref('dashboard/').push({
    //   description: form.value.new,
    //   created_on: firebase.database.ServerValue.TIMESTAMP,
    //   course_key: this.key,
    //   created_by: this.user_id
    // }).then(() => {
    //   this.success = 'New post has been succesfully update'
    //   setTimeout(function(){
    //     form.reset()
    //     this.success = null;
    //   },3000)
    // }, (err) => {
    //   this.success = err;
    //   setTimeout(function(){
    //     form.reset();
    //     this.success = null;
    //   },3000)
    // })
    if(this.file != null){
      this.dbSvc.dashboardWithFile(this.file, form.value.new, this.key, this.user_id);
    }else{
      this.dbSvc.dashboardNoFile(form.value.new, this.key, this.user_id);
    }
    
    setTimeout(() => {
      this.file == null;
      this.key == null;
      form.reset();
    },5000)
  }

  changeFile(events){
    this.file = events.target.files;
  }



}
