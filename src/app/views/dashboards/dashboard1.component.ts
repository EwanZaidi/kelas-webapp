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
import { Upload } from '../../service/upload.model';
import { UploadService } from '../../service/upload.service';

import * as _ from 'lodash';

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

  uploading: Upload;

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

  selectedPeople: Observable<any>;
  selectedMaterial: Observable<any>;

  material$ : Observable<any>;

  likes : number;
  file:any;

  doc: any;

  nDiscuss : Boolean = false;
  nMaterial : Boolean = false;
  nAddPeople : Boolean = false;
  ePeople: Boolean = false;
  dPeople: Boolean = false;
  dMaterial: Boolean = false;

  mKey: any;
  cKey: any;

  success;

  classMates: Observable<any>;

  constructor(private router: Router, private route: ActivatedRoute, private db: AngularFireDatabase, private auth: AngularFireAuth, private dis: DiscussionService, private cmt: CommentsService, private uploadSvc: UploadService) {

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

      this.classMates = this.db.list('classmates/'+this.route.snapshot.params['id']).snapshotChanges().map(a => {
        return a.map(b => {
          const data = b.payload.val();
          const key = b.payload.key;

          return {data, key};
        })
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

        }).reverse();
      });

      this.material$ = this.db.list(`materials/${this.route.snapshot.params['id']}`).snapshotChanges().map((x) => {
        return x.map((y) => {
          const key = y.payload.key;
          const data = y.payload.val();

          let user = this.db.object('users/' + data.created_by);
          let user$ = user.snapshotChanges().map((u) => {
            const data = u.payload.val();
            const key = u.payload.key;

            return {data,key}
          })

          return {data,key,user$}
        })

      });

      this.discuss = this.dis.getDicussion();
      this.home = true;
      this.discussion = false;
      this.assignment = false;
      this.materials = false;
      this.grading = false;
      this.classmates = false;
      this.dislist = false;
    })
    
  }

  createDiscussion(modal){
    this.nDiscuss = true;
    modal.show();
  }

  closeModal(modal){
    this.nDiscuss = false;
    this.nAddPeople = false;
    this.ePeople = false;
    this.dPeople = false;
    this.dMaterial = false;
    this.nMaterial = false;
    modal.hide();
  }

  addPeople(modal){
    this.nAddPeople = true;
    modal.show();
  }

  createClassmates(form, modal){
    let a : Observable<any> = this.db.list('users', ref => ref.orderByChild('email').equalTo(form.value.email)).snapshotChanges().map(a => {
      return a.map(b => {
        const data = b.payload.val();
        const key = b.payload.key;

        return {data,key};
      })
    });

    a.subscribe(b => {
      if(b.length == 0){
        firebase.database().ref('temp/people/'+this.route.snapshot.params['id']+'/classmates').push({
          email: form.value.email,
          name: form.value.name
        })
      }else{
        firebase.database().ref('classmates/'+this.route.snapshot.params['id']+'/'+b[0].key).set({
          name: form.value.name,
          email: form.value.email,
          join_date: firebase.database.ServerValue.TIMESTAMP,
          title: '',
        });
        firebase.database().ref('users/'+b[0].key+'/class_list/'+this.route.snapshot.params['id']).set({
          status: 1,
          status_date: firebase.database.ServerValue.TIMESTAMP
        });
      }
    });

    setTimeout(() => {
      this.nAddPeople = false;
      modal.hide();
    }, 2000);
  }

  deletePeople(key, modal){
    this.cKey = key;
    this.dPeople = true;
    modal.show();
  }

  confirmDelete(modal){
    firebase.database().ref('classmates/'+this.route.snapshot.params['id']+'/'+this.cKey).remove();
    firebase.database().ref('users/'+this.cKey+'/class_list/'+this.route.snapshot.params['id']).remove();

    setTimeout(() => {
      this.dPeople = false;
      modal.hide();
      this.cKey = null;
    }, 2000)
  }

  editPeople(key, modal){
    this.cKey = key;

    this.selectedPeople = this.db.object('classmates/'+this.route.snapshot.params['id']+'/'+key).valueChanges();

    this.ePeople = true;
    modal.show();
  }
  
  confirmEdit(form, modal){
    firebase.database().ref('/classmates/'+this.route.snapshot.params['id']+'/'+this.cKey).update({
      title: form.value.title,
      name: form.value.name,
      email: form.value.email
    }).then(() => {
      setTimeout(() => {
        modal.hide();
        this.ePeople = false;
        this.cKey = null;
      }, 2000);
    }).then(() => {
      this.success = 'Classmates has been updated';
      setTimeout(() => {
        this.success = null;
      },4000);
    })
  }

  addMaterial(modal){
    this.nMaterial = true;
    modal.show();
  }

  addDocument(event){
    this.doc = event.target.files;
    console.log(this.doc);
  }

  createMaterial(modal){
    const key = this.route.snapshot.params['id'];

    const filesToUpload = this.doc;
    const filesIndex = _.range(filesToUpload.length);
    _.each(filesIndex, (idx) => {
      this.uploading = new Upload(filesToUpload[idx]);
      this.uploadSvc.uploadMaterial(this.uploading,key, this.userId);
    });

    modal.hide()

    setTimeout(() => {
      this.nMaterial = false;
      this.uploading.display = null;
      this.doc = null;
    }, 5000)
  }

  deleteMaterial(key, modal){
    this.mKey = key;

    this.selectedMaterial = this.db.object(`materials/${this.route.snapshot.params['id']}/${key}`).valueChanges();
    this.dMaterial= true;

    modal.show();
    
  }

  confirmDeleteMaterial(modal){
    firebase.database().ref(`materials/${this.route.snapshot.params['id']}/${this.mKey}`).remove().then(() => {
      this.dMaterial = false;
      modal.hide();
    });
  }


}
