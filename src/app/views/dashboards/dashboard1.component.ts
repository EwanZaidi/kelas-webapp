import { Component, OnInit, OnChanges, Pipe, PipeTransform } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import {  DomSanitizer, SafeHtml, SafeStyle, SafeScript, SafeUrl, SafeResourceUrl} from '@angular/platform-browser';
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

import * as PDFJS from 'pdfjs-dist/build/pdf';
import * as moment from 'moment';

declare var jQuery: any;


@Component({
  selector: 'dashboard1',
  templateUrl: 'dashboard1.template.html',
  styleUrls: ['./dashboard1.component.css']
})

@Pipe({ name: 'safe' })

export class Dashboard1Component implements OnInit, OnChanges, PipeTransform {

  home: Boolean = false;
  discussion: Boolean = false;
  assignment: Boolean = false;
  materials: Boolean = false;
  grading: Boolean = false;
  classmates: Boolean = false;
  dislist: Boolean = false;

  canEdit: Boolean = false;

  uploading: Upload;

  userId;

  courseDetail: AngularFireObject<any>;
  courseDetail$: Observable<any>;

  dashboard: AngularFireList<any>;
  dashboard$: Observable<any>;

  profile: AngularFireObject<any>;
  profile$: Observable<any>

  discuss: any;

  disKey: any;

  disDetail: AngularFireObject<any>;
  disDetail$: Observable<any>

  created: AngularFireObject<any>;
  createdBy: Observable<any>;

  comments: any;
  comment: AngularFireObject<any>
  commentBy: Observable<any>

  selectedPeople: Observable<any>;
  selectedMaterial: Observable<any>;

  material$: Observable<any>;

  likes: number;
  file: any;

  doc: any;

  nDiscuss: Boolean = false;
  nMaterial: Boolean = false;
  nAddPeople: Boolean = false;
  ePeople: Boolean = false;
  dPeople: Boolean = false;
  dMaterial: Boolean = false;
  dDiscuss: Boolean = false;
  eDiscuss: Boolean = false;

  delete_comment: Boolean = false;

  mKey: any;
  cKey: any;
  dKey: any;

  edit_activity: Boolean = false;
  delete_activity: Boolean = false;
  delete_dis_comment: Boolean = false;

  delete_course: Boolean = false;
  edit_course: Boolean = false;

  success;

  classMates: Observable<any>;

  selected_discuss: Observable<any>;

  selected_activity: Observable<any>;

  dkey: any;

  selected_course: Observable<any>;

  sDate;
  eDate;

  files;

  pdfSrc = 'https://firebasestorage.googleapis.com/v0/b/kelas-dev.appspot.com/o/materials%2F-L9V_rrUIcKCvju5X3XL%2Fterms-and-conditions-template.pdf?alt=media&token=d8697732-a059-4d65-a8fe-1d2b3257c870';

  constructor(private loc: Location, private router: Router, private route: ActivatedRoute, private db: AngularFireDatabase, private auth: AngularFireAuth, private dis: DiscussionService, private cmt: CommentsService, private uploadSvc: UploadService, private sanitizer: DomSanitizer) {

    this.dis.getId(this.route.snapshot.params['id'])
    // window.location.reload();
    this.auth.authState.subscribe(user => {
      if (user) this.userId = user.uid;

      this.courseDetail = this.db.object('courses/course_list/' + this.route.snapshot.params['id']);
      this.courseDetail$ = this.courseDetail.snapshotChanges().map((x) => {
        const data = x.payload.val();
        const key = x.payload.key;

        if(data.image_url === undefined || data.image_url === null){
          data.image_url = '../../../assets/images/LOGO.png';
        }
        return {data,key}
      });

      this.courseDetail$.subscribe(x => {
        this.profile = this.db.object('users/' + x.created_by);
        this.profile$ = this.profile.valueChanges();
      })

      this.dashboard = this.db.list('dashboard/', ref => ref.orderByChild('course_key').equalTo(this.route.snapshot.params['id']));
      this.dashboard$ = this.dashboard.snapshotChanges().map((d) => {
        return d.map((db) => {
          const data = db.payload.val();
          const key = db.payload.key;

          const comments = this.cmt.getActivityComments(key);

          let user = this.db.object('users/' + data.created_by);
          let user$ = user.snapshotChanges().map((u) => {
            const data = u.payload.val();
            const key = u.payload.key;

            return { data, key }
          })

          return { data, key, comments, user$ }

        }).reverse();
      });

      this.discuss = this.dis.getDicussion(this.userId);

    })

  }

  disDetails(key) {
    this.home = false;
    this.discussion = false;
    this.assignment = false;
    this.materials = false;
    this.grading = false;
    this.classmates = false;
    this.dislist = true;

    this.disKey = key;

    this.cmt.getId(key, this.userId);

    this.disDetail = this.db.object('discussion/' + this.route.snapshot.params['id'] + '/discussion_list/' + key);
    this.disDetail$ = this.disDetail.valueChanges();

    this.disDetail$.subscribe(x => {
      this.profile = this.db.object('users/' + x.created_by);
      this.profile$ = this.profile.valueChanges();
      this.created = this.db.object('/users/' + x.created_by);
      this.createdBy = this.created.valueChanges();
    })

    this.comments = this.cmt.getComments();
  }

  toDisList() {
    this.home = false;
    this.discussion = true;
    this.assignment = false;
    this.materials = false;
    this.grading = false;
    this.classmates = false;
    this.dislist = false;
  }

  like(key) {

    let a: AngularFireObject<any> = this.db.object('/comments/' + this.disKey + '/comment_list/' + key);
    let b: Observable<any> = a.valueChanges();
    b.subscribe(x => {
      this.likes = x.likes;
    })

    firebase.database().ref().child('/comments/' + this.disKey + '/comment_list/' + key).update({
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

  create(newDiscuss, createDiscuss) {
    if (this.file != null) {
      this.dis.createDiscussionWithFile(newDiscuss.value.title, newDiscuss.value.description, this.file, this.route.snapshot.params['id'], this.userId);
    } else {
      this.file = null;
      this.dis.createDiscussion(newDiscuss.value.title, newDiscuss.value.description, this.userId);
    }
    createDiscuss.hide();
    this.file = null;
  }

  onKeydown(commentForm) {
    this.cmt.newComments(commentForm.value.comment);
    commentForm.reset();
  }

  ngOnChanges() {

  }

  changeFile(events) {
    this.file = events.target.files;
  }

  ngOnInit() {
    this.route.params.subscribe(x => {
      this.dis.getId(this.route.snapshot.params['id']);
      this.courseDetail = this.db.object('courses/course_list/' + this.route.snapshot.params['id']);
      this.courseDetail$ = this.courseDetail.snapshotChanges().map((x) => {
        const data = x.payload.val();
        const key = x.payload.key;

        if(data.image_url === undefined || data.image_url === null){
          data.image_url = '../../../assets/images/LOGO.png';
        }
        return {data,key}
      });

      this.courseDetail$.subscribe(x => {
        this.profile = this.db.object('users/' + x.created_by);
        this.profile$ = this.profile.valueChanges();
      })

      this.classMates = this.db.list('classmates/' + this.route.snapshot.params['id']).snapshotChanges().map(a => {
        return a.map(b => {
          const data = b.payload.val();
          const key = b.payload.key;

          return { data, key };
        })
      })

      this.classMates.subscribe();

      this.dashboard = this.db.list('dashboard/', ref => ref.orderByChild('course_key').equalTo(this.route.snapshot.params['id']));
      this.dashboard$ = this.dashboard.snapshotChanges().map((d) => {
        return d.map((db) => {
          const data = db.payload.val();
          const key = db.payload.key;

          const comments = this.cmt.getActivityComments(key);

          let user = this.db.object('users/' + data.created_by);
          let user$ = user.snapshotChanges().map((u) => {
            const data = u.payload.val();
            const key = u.payload.key;

            return { data, key }
          })

          return { data, key, comments, user$ }

        }).reverse();
      });

      this.dashboard$.subscribe();

      this.material$ = this.db.list(`materials/${this.route.snapshot.params['id']}`).snapshotChanges().map((x) => {
        return x.map((y) => {
          const key = y.payload.key;
          const data = y.payload.val();

          let user = this.db.object('users/' + data.created_by);
          let user$ = user.snapshotChanges().map((u) => {
            const data = u.payload.val();
            const key = u.payload.key;

            return { data, key }
          })

          return { data, key, user$ }
        })

      });

      this.material$.subscribe();

      this.discuss = this.dis.getDicussion(this.userId);
      this.home = true;
      this.discussion = false;
      this.assignment = false;
      this.materials = false;
      this.grading = false;
      this.classmates = false;
      this.dislist = false;
    })


  }

  createDiscussion(modal) {
    this.nDiscuss = true;
    modal.show();
  }

  closeModal(modal) {
    this.nDiscuss = false;
    this.nAddPeople = false;
    this.ePeople = false;
    this.dPeople = false;
    this.dMaterial = false;
    this.nMaterial = false;
    this.eDiscuss = false;
    this.dDiscuss = false;
    this.delete_comment = false;
    this.edit_activity = false;
    this.delete_activity = false;
    this.delete_dis_comment = false;
    this.edit_course = false;
    this.delete_course = false;
    modal.hide();
  }

  addPeople(modal) {
    this.nAddPeople = true;
    modal.show();
  }

  createClassmates(form, modal) {
    let a: Observable<any> = this.db.list('users', ref => ref.orderByChild('email').equalTo(form.value.email)).snapshotChanges().map(a => {
      return a.map(b => {
        const data = b.payload.val();
        const key = b.payload.key;

        return { data, key };
      })
    });

    a.subscribe(b => {
      if (b.length == 0) {
        firebase.database().ref('temp/people/' + this.route.snapshot.params['id'] + '/classmates').push({
          email: form.value.email,
          name: form.value.name
        })
      } else {
        firebase.database().ref('classmates/' + this.route.snapshot.params['id'] + '/' + b[0].key).set({
          name: form.value.name,
          email: form.value.email,
          join_date: firebase.database.ServerValue.TIMESTAMP,
          title: '',
        });
        firebase.database().ref('users/' + b[0].key + '/class_list/' + this.route.snapshot.params['id']).set({
          status: 1,
          status_date: firebase.database.ServerValue.TIMESTAMP
        });
        this.home = false;
        this.discussion = false;
        this.assignment = false;
        this.materials = false;
        this.grading = false;
        this.classmates = true;
        this.dislist = false;
      }
    });

    setTimeout(() => {
      this.nAddPeople = false;
      modal.hide();
    }, 2000);
  }

  deletePeople(key, modal) {
    this.cKey = key;
    this.dPeople = true;
    modal.show();
  }

  confirmDelete(modal) {
    firebase.database().ref('classmates/' + this.route.snapshot.params['id'] + '/' + this.cKey).remove();
    firebase.database().ref('users/' + this.cKey + '/class_list/' + this.route.snapshot.params['id']).remove();

    setTimeout(() => {
      this.dPeople = false;
      modal.hide();
      this.cKey = null;
    }, 2000)
  }

  editPeople(key, modal) {
    this.cKey = key;

    this.selectedPeople = this.db.object('classmates/' + this.route.snapshot.params['id'] + '/' + key).valueChanges();

    this.ePeople = true;
    modal.show();
  }

  confirmEdit(form, modal) {
    firebase.database().ref('/classmates/' + this.route.snapshot.params['id'] + '/' + this.cKey).update({
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
      }, 4000);
    })
  }

  addMaterial(modal) {
    this.nMaterial = true;
    modal.show();
  }

  addDocument(event) {
    this.doc = event.target.files;
    console.log(this.doc);
  }

  createMaterial(modal) {
    const key = this.route.snapshot.params['id'];

    const filesToUpload = this.doc;
    const filesIndex = _.range(filesToUpload.length);
    _.each(filesIndex, (idx) => {
      this.uploading = new Upload(filesToUpload[idx]);
      this.uploadSvc.uploadMaterial(this.uploading, key, this.userId);
    });

    modal.hide()

    setTimeout(() => {
      this.nMaterial = false;
      this.uploading.display = null;
      this.doc = null;
    }, 5000)
  }

  deleteMaterial(key, modal) {
    this.mKey = key;

    this.selectedMaterial = this.db.object(`materials/${this.route.snapshot.params['id']}/${key}`).valueChanges();
    this.dMaterial = true;

    modal.show();

  }

  confirmDeleteMaterial(modal) {
    firebase.database().ref(`materials/${this.route.snapshot.params['id']}/${this.mKey}`).remove().then(() => {
      this.dMaterial = false;
      modal.hide();
    });
  }

  editDiscussion(key, modal) {

    this.dKey = key;
    this.selected_discuss = this.db.object('discussion/' + this.route.snapshot.params['id'] + '/discussion_list/' + this.dKey).valueChanges();
    this.eDiscuss = true;

    modal.show();
  }

  deleteDiscussion(key, modal) {
    this.dKey = key;
    this.dDiscuss = true;

    modal.show()
  }

  confirmDeleteDiscuss(modal) {
    firebase.database().ref('discussion/' + this.route.snapshot.params['id'] + '/discussion_list/' + this.dKey).remove().then(() => {
      this.dKey = null;
      this.dDiscuss = false;
      modal.hide();
    });
  }

  confirmEditDiscuss(form, modal) {
    firebase.database().ref('discussion/' + this.route.snapshot.params['id'] + '/discussion_list/' + this.dKey).update({
      title: form.value.title,
      description: form.value.description,
      created_on: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
      this.eDiscuss = false;
      modal.hide();
    }).then(() => {
      this.success = 'Succesfully updated your discussion';
      setTimeout(() => {
        this.success = null;
      }, 3000)
    })
  }

  editModal(key, modal) {
    this.edit_activity = true;
    this.selected_activity = this.db.object('dashboard/' + key).snapshotChanges().map((s) => {
      const data = s.payload.val();
      const key = s.key;

      if (data.comment == null) {
        data.comment = ''
      }

      return { data, key };
    });

    modal.show();
  }

  deleteModal(key, modal) {
    this.delete_activity = true;
    this.selected_activity = this.db.object('dashboard/' + key).snapshotChanges().map((s) => {
      const data = s.payload.val();
      const key = s.key;

      if (data.comment == null) {
        data.comment = ''
      }

      return { data, key };
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
      this.success = 'Your activity has been successfully updated';
      setTimeout(() => {
        this.success = null;
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
      this.success = 'Your activity has been successfully removed';
      setTimeout(() => {
        this.success = null;
      }, 3000);
    });
  }

  addComment(form, key) {
    this.cmt.getCommentId(key, this.userId);
    this.cmt.newActivityComments(form.value.comment);
    setTimeout(() => {
      form.reset();
    }, 500);
  }

  deleteComment(key, dkey, modal) {
    this.dkey = dkey;
    this.delete_comment = true;
    this.selected_activity = this.db.object('/comments/' + dkey + '/comment_list/' + key).snapshotChanges().map((s) => {
      const data = s.payload.val();
      const key = s.key;

      if (data.comment == null) {
        data.comment = ''
      }

      return { data, key };
    });

    modal.show();
  }

  deleteCmt(key, modal) {
    firebase.database().ref('/comments/' + this.dkey + '/comment_list/' + key).remove().then(() => {
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

  deleteDiscComment(key, modal) {
    this.dkey = key;
    this.delete_dis_comment = true;
    this.selected_activity = this.db.object('/comments/' + this.disKey + '/comment_list/' + key).snapshotChanges().map((s) => {
      const data = s.payload.val();
      const key = s.key;

      if (data.comment == null) {
        data.comment = ''
      }

      return { data, key };
    });

    modal.show();
  }

  delDiscComment(modal) {
    firebase.database().ref('/comments/' + this.disKey + '/comment_list/' + this.dkey).remove().then(() => {
      this.delete_dis_comment = false;
      modal.hide();
    }).then(() => {
      document.body.scrollTop = document.documentElement.scrollTop = 0;
      this.success = 'Your comments has been successfully removed';
      setTimeout(() => {
        this.success = null;
      }, 3000);
    });
  }

  editCourse(modal) {
    this.edit_course = true;

    this.selected_course = this.db.object('courses/course_list/' + this.route.snapshot.params['id']).snapshotChanges().map(x => {
      const data = x.payload.val();
      const key = x.payload.key;

      let startDate = new Date(data.start_date * 1000);
      this.sDate = startDate.getDate();

      let endDate = new Date(data.end_date * 1000);
      this.eDate = endDate.getDate();

      return { data, key };

    })

    modal.show();
  }

  deleteCourse(modal) {
    this.delete_course = true;

    this.selected_course = this.db.object('courses/course_list/' + this.route.snapshot.params['id']).snapshotChanges().map(x => {
      const data = x.payload.val();
      const key = x.payload.key;

      return { data, key };

    })

    modal.show();
  }

  saveEditCourse(form, modal) {
    let start = new Date(form.value.startDate);
    let end = new Date(form.value.endDate);


    this.edit_course = false;


    firebase.database().ref('courses/course_list/' + this.route.snapshot.params['id']).update({
      course_name: form.value.courseName,
      description: form.value.description,
      location: form.value.location,
      start_date: start.getTime() / 1000.0,
      end_date: end.getTime() / 1000.0
    }).then((success) => {
      this.success = 'Your course has been successfully updated';
      document.body.scrollTop = document.documentElement.scrollTop = 0;
      setTimeout(function () {
        form.reset();
        modal.hide();
        this.success = null;
        window.location.reload();
      }, 1000)
    })
  }

  confirmDeleteCourse(modal) {

    firebase.database().ref('courses/course_list/' + this.route.snapshot.params['id']).remove();
    this.success = 'Your course has been successfully removed';
    this.edit_course = false;
    document.body.scrollTop = document.documentElement.scrollTop = 0;

    setTimeout(() => {
      this.success = null;
      this.router.navigateByUrl('/recent')
      modal.hide()
    }, 1000)

  }

  handleFiles(event){
    this.files = event.target.files;
  }

  confirmChangeIcon(modal){
    const filesToUpload = this.files;
    const filesIndex = _.range(filesToUpload.length);
    _.each(filesIndex, (idx) => {
      this.uploading = new Upload(filesToUpload[idx]);
      this.uploadSvc.uploadFile3(this.uploading, this.route.snapshot.params['id']);
    });

    modal.hide()
  }

  transform(url, type:string): SafeHtml | SafeStyle | SafeScript | SafeUrl | SafeResourceUrl {
    switch(type){
      case 'html': return this.sanitizer.bypassSecurityTrustHtml(url);
			case 'style': return this.sanitizer.bypassSecurityTrustStyle(url);
			case 'script': return this.sanitizer.bypassSecurityTrustScript(url);
			case 'url': return this.sanitizer.bypassSecurityTrustUrl(url);
			case 'resourceUrl': return this.sanitizer.bypassSecurityTrustResourceUrl(url);
			default: throw new Error(`Invalid safe type specified: ${type}`);
    }
  }

}
