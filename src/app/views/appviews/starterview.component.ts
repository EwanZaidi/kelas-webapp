import { CommentsService } from '../../service/comments.service';
import { Component, OnDestroy, OnInit, OnChanges, ViewChild } from '@angular/core';
import { AngularFireDatabase, AngularFireObject, AngularFireList } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import { NgForm } from '@angular/forms';
import * as firebase from 'firebase';
import { DashboardService } from '../../service/dashboard.service';

import * as moment from 'moment';

@Component({
  selector: 'starter',
  templateUrl: 'starter.template.html'
})

export class StarterViewComponent implements OnDestroy, OnInit, OnChanges{

  @ViewChild('myInput') myVariable: any;

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

  edit_success;
  delete_success;

  edit_activity: Boolean = false;
  delete_activity: Boolean = false;

  success = null;

  selected_activity : Observable<any>;

  comments : Observable<any>;

  date = new Date();

  task$ : Observable<any>;

  task_key: any;

  selected_task: Observable<any>;
  edit_task: boolean = false;
  delete_task:boolean = false;
  create_task: boolean = false;

  dkey: any;
  delete_comment : Boolean = false;


  constructor(private cmt: CommentsService, private db: AngularFireDatabase, private afAuth: AngularFireAuth, private dbSvc: DashboardService) {
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

            const comments = this.cmt.getActivityComments(key);

            return {data,key, comments};
          }).reverse();
        })

        this.task$ = this.db.list('task/'+this.user_id+'/task_list').snapshotChanges().map(x => {
          return x.map(y => {
            const data = y.payload.val();
            const key = y.payload.key;

            data.mydate = new Date(data.date * 1000);
            data.moment = moment(data.created_on).fromNow();

            return {data,key};
          })
        })

        this.task$.subscribe(x => {
          x.forEach(y => {
            console.log(y.data.mydate.getDate());
          })
        });
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
    if (this.file != null) {
      this.dbSvc.dashboardWithFile(this.file, form.value.new, this.key, this.user_id);
    }else {
      this.dbSvc.dashboardNoFile(form.value.new, this.key, this.user_id);
    }
    setTimeout(() => {
      this.file = null;
      this.key = null;
      this.myVariable.nativeElement.value = '';
      form.reset();
    }, 5000 );
  }

  changeFile(events) {
    this.file = events.target.files;
  }

  editModal(key, modal) {
    this.edit_activity = true;
    this.selected_activity = this.db.object('dashboard/' + key).snapshotChanges().map((s) => {
      const data = s.payload.val();
      const key = s.key;

      return {data, key};
    });

    modal.show();
  }

  addedTask(form, modal){

    let date = new Date(form.value.date);    
    const myEpoch = date.getTime()/1000.0;
    
    firebase.database().ref('task/'+this.user_id+'/task_list').push({
      name: form.value.name,
      description: form.value.desc,
      created_on: firebase.database.ServerValue.TIMESTAMP,
      date: myEpoch
    })

    modal.hide();
  }


  deleteModal(key, modal) {
    this.delete_activity = true;
    this.selected_activity = this.db.object('dashboard/' + key).snapshotChanges().map((s) => {
      const data = s.payload.val();
      const key = s.key;

      return {data, key};
    });

    modal.show();
  }

  edit(form, key, modal) {
    firebase.database().ref('dashboard/' + key).update({
      description: form.value.desc
    }).then(() => {
      this.edit_activity = false;
      // this.sortAgain();
      modal.hide();
    }).then(() => {
      document.body.scrollTop = document.documentElement.scrollTop = 0;
      this.edit_success = 'Your activity has been successfully updated';
      setTimeout(() => {
        this.edit_success = null;
      }, 3000);
    });
  }

  delete(key, modal) {
    firebase.database().ref('dashboard/' + key).remove().then(() => {
      this.delete_activity = false;
      // this.sortAgain();
      modal.hide();
    }).then(() => {
      document.body.scrollTop = document.documentElement.scrollTop = 0;
      this.delete_success = 'Your activity has been successfully removed';
      setTimeout(() => {
        this.delete_success = null;
      }, 3000);
    });
  }

  ngOnChanges() {}

  sortAgain() {
    // this.dashboard = this.db.list('dashboard/', ref => ref.orderByChild('created_by').equalTo(this.user_id));
    // this.dash = this.dashboard.snapshotChanges().map((d) => { 
    //   d.reverse();
    //   return d.map(db => {
    //     const data = db.payload.val();
    //     const key = db.payload.key;

    //     return {data, key};
    //   });
    // });
  }

  addComment(form, key) {
    this.cmt.getCommentId(key, this.user_id);
    this.cmt.newActivityComments(form.value.comment);
    setTimeout(() => {
      form.reset();
    }, 500);
  }

  deleteTask(key,modal){
    this.delete_task = true;
    this.task_key = key;
    this.selected_task = this.db.object('task/'+this.user_id+'/task_list/'+key).valueChanges();
    modal.show();
  }

  deletedTask(modal){
    firebase.database().ref('task/'+this.user_id+'/task_list/'+this.task_key).remove();
    this.delete_task = false;
    modal.hide()
  }

  closeModal(modal){
    this.delete_task = false;
    this.edit_task = false;
    this.create_task = false;
    this.edit_activity = false;
    this.delete_activity = false;
    this.delete_comment = false;

    modal.hide();
  }

  createdTask(modal){
    this.create_task = true;
    modal.show();
  }

  editTask(key, modal){
    this.selected_task = this.db.object('task/'+this.user_id+'/task_list/'+key).snapshotChanges().map(x => {
      const data = x.payload.val();
      data.mydate = new Date(data.date * 1000);
      
      return {data};
    });

    this.task_key = key;
    this.edit_task = true;
    modal.show();
  }

  editedTask(form,modal){

    let date = new Date(form.value.date);    
    const myEpoch = date.getTime()/1000.0;

    firebase.database().ref('task/'+this.user_id+'/task_list/'+this.task_key).update({
      name: form.value.name,
      description: form.value.desc,
      created_on: firebase.database.ServerValue.TIMESTAMP,
      date: myEpoch
    });
    
    this.edit_task = false;
    modal.hide();
  }

  deleteComment(key, dkey,modal){
    this.dkey = dkey;
    this.delete_comment = true;
    this.selected_activity = this.db.object('/comments/' + dkey + '/comment_list/'+key).snapshotChanges().map((s) => {
      const data = s.payload.val();
      const key = s.key;

      return {data, key};
    });

    modal.show();
  }

  deleteCmt(key, modal){
    firebase.database().ref('/comments/' + this.dkey + '/comment_list/'+key).remove().then(() => {
      this.delete_comment = false;
      modal.hide();
    }).then(() => {
      document.body.scrollTop = document.documentElement.scrollTop = 0;
      this.success = 'Your comments has been successfully removed';
      setTimeout(() => {
        this.success = null;
      }, 3000);
    });
  }



}
