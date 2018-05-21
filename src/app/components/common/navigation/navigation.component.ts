import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import 'jquery-slimscroll';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable'
import { AngularFireDatabase, AngularFireObject, AngularFireList } from 'angularfire2/database';
import * as _ from 'lodash';
import { Upload } from '../../../service/upload.model';
import { UploadService } from '../../../service/upload.service';

declare var jQuery: any;

@Component({
  selector: 'navigation',
  templateUrl: 'navigation.template.html'
})

export class NavigationComponent implements OnInit {

  @ViewChild('myImage')
  myInputVariable: any;

  prof: Boolean = true;
  abt: Boolean = false;
  noti: Boolean = false;

  discussion: Boolean;
  assignment: Boolean;
  meeting: Boolean;

  courseList: AngularFireList<any>;
  courseList$: Observable<any>;

  profile: AngularFireObject<any>;
  profile$: Observable<any>
  pro: any;

  pref: AngularFireObject<any>;
  pref$: Observable<any>

  edited: Boolean = false;
  success: any;

  level = [{ id: 'Primary' }, { id: 'Secondary' }, { id: 'Post-secondary' }, { id: 'Graduate / Post Graduate' }, { id: 'Other' }]

  userid;

  files;
  uploading: Upload;

  constructor(private router: Router, private afAuth: AngularFireAuth, private db: AngularFireDatabase, private uploadService: UploadService ) {
    this.afAuth.authState.subscribe(x => {
      if (x) {
        this.userid = x.uid;
      }

      this.profile = this.db.object('/users/' + this.userid);
      this.profile$ = this.profile.snapshotChanges().map(user => {
        const val = user.payload.val();
        const key = user.payload.key;

        return { val, key }
      })

      this.pref = this.db.object('/preferences/' + this.userid);
      this.pref$ = this.pref.snapshotChanges().map(prefs => {
        const val = prefs.payload.val();
        const key = prefs.payload.key;

        return { val, key }
      })

      this.pref$.subscribe(p => {
        this.assignment = p.val.assignment;
        this.discussion = p.val.discussion;
        this.meeting = p.val.meeting;
      })

      this.profile$.subscribe(p => {
        this.pro = p.val;
      })

      this.courseList = this.db.list('/courses/course_list', ref => ref.orderByChild('created_by').equalTo(this.userid));
      this.courseList$ = this.courseList.snapshotChanges().map(x => {
        return x.map(y => {
          const val = y.payload.val();
          const key = y.payload.key;

          return { val, key }
        })
      });


    })
  }

  ngAfterViewInit() {
    jQuery('#side-menu').metisMenu();

    if (jQuery("body").hasClass('fixed-sidebar')) {
      jQuery('.sidebar-collapse').slimscroll({
        height: '100%'
      })
    }
  }

  activeRoute(routename: string): boolean {
    return this.router.url.indexOf(routename) > -1;
  }

  tab(name: String) {
    if (name == 'prof') {
      this.prof = true;
      this.abt = false;
      this.noti = false;
    } else if (name == 'abt') {
      this.prof = false;
      this.abt = true;
      this.noti = false;
    } else {
      this.prof = false;
      this.abt = false;
      this.noti = true;
    }
  }

  changeDiscuss(event: any) {
    this.discussion = !this.discussion;
  }

  changeAssignment(event: any) {
    this.assignment = !this.assignment;
  }

  changeMeeting(event: any) {
    this.meeting = !this.meeting;
  }

  profileSubmit(profileForm,profileModal) {
    this.db.object('/users/' + this.userid).update({
      display_name: profileForm.value.displayName,
      email: profileForm.value.email,
      full_name: profileForm.value.fullName
    }).then(x => {
      this.edited = !this.edited;
      document.body.scrollTop = document.documentElement.scrollTop = 0;
      setTimeout(function () {
        this.edited = false;
        profileModal.hide()
      }.bind(this), 3000);
    })
  }

  aboutSubmit(aboutForm,profileModal) {
    this.db.object('/users/' + this.userid).update({
      title: aboutForm.value.title,
      about: aboutForm.value.aboutYou
    }).then(x => {
      this.edited = !this.edited;
      document.body.scrollTop = document.documentElement.scrollTop = 0;
      setTimeout(function () {
        this.edited = false;
        profileModal.hide()
      }.bind(this), 3000);
    })
  }

  notiSubmit(profileModal) {
    this.db.object('/preferences/' + this.userid).update({
      discussion: this.discussion,
      assignment: this.assignment,
      meeting: this.meeting
    }).then(x => {
      this.edited = !this.edited;
      document.body.scrollTop = document.documentElement.scrollTop = 0;
      setTimeout(function () {
        this.edited = false;
        profileModal.hide()
      }.bind(this), 3000);
    })
  }

  removePhoto() {
    this.db.object('/users/' + this.userid).update({
      image_url: "https://firebasestorage.googleapis.com/v0/b/kelas-dev.appspot.com/o/default.png?alt=media&token=64fce9a8-a932-415b-b3e8-d159793b23ed"
    })
  }

  saveCourse(newCourse, createCourse) {
    let sd = new Date(newCourse.value.startDate);
    let sde = sd.getTime() / 1000.0;

    let ed = new Date(newCourse.value.endDate);
    let ede = ed.getTime() / 1000.0;

    let text = this.makeid();
    this.db.list('courses/course_list').push({
      course_tag: text,
      course_name: newCourse.value.courseName,
      section: newCourse.value.section,
      description: newCourse.value.description,
      location: newCourse.value.location,
      start_date: sde,
      end_date: ede,
      course_level: newCourse.value.courseLevel,
      created_by: this.userid,
      created_on: firebase.database.ServerValue.TIMESTAMP
    }).then((success) => {
      this.success = 'Your course has been successfully added';
      document.body.scrollTop = document.documentElement.scrollTop = 0;
      setTimeout(function () {
        this.success = null
        createCourse.hide()
      }, 3000)
    })
  }

  makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    for (var i = 0; i < 8; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }

  ngOnInit() { }

  getPage(key) {
    this.router.navigateByUrl('/courses/' + key)
  }

  handleFiles(event) {
    console.log(event.target.files);
    this.files = event.target.files;
    this.uploadFiles();
  }

  uploadFiles() {
    const filesToUpload = this.files;
    const filesIndex = _.range(filesToUpload.length);
    _.each(filesIndex, (idx) => {
      this.uploading = new Upload(filesToUpload[idx]);
      this.uploadService.uploadFile(this.uploading);
    });
    this.reset();
  }

  reset() {
    this.myInputVariable.nativeElement.value = "";
  }

}
