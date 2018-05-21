import { Component, OnInit, OnChanges } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
// Import Chart.js library
import 'chart.js';

import { NgForm } from '@angular/forms';

import { FlotChartDirective } from '../../components/charts/flotChart';
import { AngularFireDatabase, AngularFireObject, AngularFireList } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { DiscussionService } from '../../service/discussion.service';
import { CommentsService } from '../../service/comments.service';

import * as firebase from 'firebase/app';

declare var jQuery: any;


@Component({
  selector: 'dashboard1',
  templateUrl: 'dashboard1.template.html',
  styleUrls: ['./dashboard1.component.css']
})

export class Dashboard1Component implements OnInit, OnChanges {

  home: Boolean = false;
  discussion: Boolean = false;
  assignment: Boolean = false;
  materials: Boolean = false;
  grading: Boolean = false;
  classmates: Boolean = false;
  dislist: Boolean = false;

  userId;

  courseDetail: AngularFireObject<any>;
  courseDetail$: Observable<any>;

  dashboard: AngularFireList<any>;
  dashboard$: Observable<any>;

  profile: AngularFireObject<any>;
  profile$: Observable<any>

  discuss:any;
  
  disKey:any;

  disDetail: AngularFireObject<any>;
  disDetail$: Observable<any>

  created: AngularFireObject<any>;
  createdBy: Observable<any>;

  comments: any;
  comment: AngularFireObject<any>
  commentBy: Observable<any>

  likes : number;
  file:any;

  constructor(private router: Router, private route: ActivatedRoute, private db: AngularFireDatabase, private auth: AngularFireAuth, private dis: DiscussionService, private cmt: CommentsService) {

    this.dis.getId(this.route.snapshot.params['id'])
    // window.location.reload();
    this.auth.authState.subscribe(user => {
      if (user) this.userId = user.uid;

      this.courseDetail = this.db.object('courses/course_list/' + this.route.snapshot.params['id']);
      this.courseDetail$ = this.courseDetail.valueChanges();

      this.courseDetail$.subscribe(x => {
        this.profile = this.db.object('users/' + x.created_by);
        this.profile$ = this.profile.valueChanges();
      })

      this.dashboard = this.db.list('dashboard/', ref => ref.orderByChild('course_key').equalTo(this.route.snapshot.params['id']));
      this.dashboard$ = this.dashboard.valueChanges();

      this.discuss = this.dis.getDicussion();

    })

  }

  disDetails(key){
    this.home = false;
    this.discussion = false;
    this.assignment = false;
    this.materials = false;
    this.grading = false;
    this.classmates = false;
    this.dislist = true;

    this.disKey = key;

    this.cmt.getId(key, this.userId);

    this.disDetail = this.db.object('discussion/'+this.route.snapshot.params['id']+'/discussion_list/'+key);
    this.disDetail$ = this.disDetail.valueChanges();

    this.disDetail$.subscribe(x => {
      this.profile = this.db.object('users/' + x.created_by);
      this.profile$ = this.profile.valueChanges();      
      this.created = this.db.object('/users/'+x.created_by);
      this.createdBy = this.created.valueChanges();
    })

    this.comments = this.cmt.getComments();
  }

  toDisList(){
    this.home = false;
    this.discussion = true;
    this.assignment = false;
    this.materials = false;
    this.grading = false;
    this.classmates = false;
    this.dislist = false;
  }

  like(key){

    let a : AngularFireObject<any> = this.db.object('/comments/'+this.disKey+'/comment_list/'+key);
    let b :  Observable<any> = a.valueChanges();
    b.subscribe(x => {
      this.likes = x.likes;
    })

    firebase.database().ref().child('/comments/'+this.disKey+'/comment_list/'+key).update({
      likes: this.likes + 1 
    })
  }

  list(mode) {
    if (mode == 'home') {
      this.home = true;
      this.discussion = false;
      this.assignment = false;
      this.materials = false;
      this.grading = false;
      this.classmates = false;
      this.dislist = false;
    } else if (mode == 'discussion') {
      this.home = false;
      this.discussion = true;
      this.assignment = false;
      this.materials = false;
      this.grading = false;
      this.classmates = false;
      this.dislist = false;
    } else if (mode == 'assignment') {
      this.home = false;
      this.discussion = false;
      this.assignment = true;
      this.materials = false;
      this.grading = false;
      this.classmates = false;
      this.dislist = false;
    } else if (mode == 'materials') {
      this.home = false;
      this.discussion = false;
      this.assignment = false;
      this.materials = true;
      this.grading = false;
      this.classmates = false;
      this.dislist = false;
    } else if (mode == 'grading') {
      this.home = false;
      this.discussion = false;
      this.assignment = false;
      this.materials = false;
      this.grading = true;
      this.classmates = false;
      this.dislist = false;
    } else if (mode == 'classmates') {
      this.home = false;
      this.discussion = false;
      this.assignment = false;
      this.materials = false;
      this.grading = false;
      this.classmates = true;
      this.dislist = false;
    }
  }

  create(newDiscuss, createDiscuss){
    if(this.file != null){
      this.dis.createDiscussionWithFile(newDiscuss.value.title,newDiscuss.value.description, this.file,this.route.snapshot.params['id'],this.userId);
    }else{
      this.file = null;
      this.dis.createDiscussion(newDiscuss.value.title,newDiscuss.value.description,this.userId);
    }
    createDiscuss.hide();
    this.file = null;
  }

  onKeydown(commentForm){
    this.cmt.newComments(commentForm.value.comment);
    commentForm.reset();
  }

  ngOnChanges() {

  }

  changeFile(events){
    this.file = events.target.files;
  }

  ngOnInit() {
    this.route.params.subscribe(x => {
      this.dis.getId(this.route.snapshot.params['id'])
      this.courseDetail = this.db.object('courses/course_list/' + this.route.snapshot.params['id']);
      this.courseDetail$ = this.courseDetail.valueChanges();

      this.courseDetail$.subscribe(x => {
        this.profile = this.db.object('users/' + x.created_by);
        this.profile$ = this.profile.valueChanges();
      })

      this.dashboard = this.db.list('dashboard/', ref => ref.orderByChild('course_key').equalTo(this.route.snapshot.params['id']));
      this.dashboard$ = this.dashboard.snapshotChanges().map((d) => {
        return d.map((db) => {
          const data = db.payload.val();
          const key = db.payload.key;

          let user = this.db.object('users/' + data.created_by);
          let user$ = user.snapshotChanges().map((u) => {
            const data = u.payload.val();
            const key = u.payload.key;

            return {data,key}
          })

          return {data,key,user$}

        })
      })

      this.dashboard$.subscribe((x) => console.log(x))

      this.discuss = this.dis.getDicussion();
      this.home = false;
      this.discussion = false;
      this.assignment = false;
      this.materials = false;
      this.grading = false;
      this.classmates = false;
      this.dislist = false;
    })
    
  }


}
