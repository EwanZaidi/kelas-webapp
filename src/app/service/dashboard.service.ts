import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { Upload } from './upload.model';
import * as _ from 'lodash';
import { AngularFireDatabase } from 'angularfire2/database';

@Injectable()
export class DashboardService {

  files;
  group;
  uploading: any;

  constructor(private db: AngularFireDatabase) { }

  dashboardWithFile(file, form, group, uid) {
    this.files = file;
    this.group = group;
    let a = firebase.database().ref().child('dashboard').push({
      course_key: group,
      description: form,
      created_by: uid,
      created_on: firebase.database.ServerValue.TIMESTAMP,
    })

    this.uploadFiles(a,uid);
  }

  dashboardNoFile(form, group, uid) {
    this.group = group;
    let a = firebase.database().ref().child('dashboard').push({
      course_key: group,
      description: form,
      created_by: uid,
      created_on: firebase.database.ServerValue.TIMESTAMP,
    })
  }

  uploadFiles(a, uid) {
    const filesToUpload = this.files;
    const filesIndex = _.range(filesToUpload.length);
    _.each(filesIndex, (idx) => {
      this.uploading = new Upload(filesToUpload[idx]);
      this.uploadFile2(this.uploading, a.key, this.group, uid);
    });
  }

  uploadFile2(upload: Upload, key, group, uid) {
    const storageRef = firebase.storage().ref();
    const uploadTask = storageRef.child(`dashboard/`+uid+`/${upload.file.name}`)
      .put(upload.file);

    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,

      (snapshot) => {
        let snap = snapshot as firebase.storage.UploadTaskSnapshot;
      },

      (error) => {
        console.log(error);
      },

      (): any => {
        upload.image_url = uploadTask.snapshot.downloadURL;
        this.saveFileData2(upload, key)
      });
  }

  private saveFileData2(upload: Upload, key) {
    this.db.object(`dashboard/`+key).update({ image: upload.image_url })
  }

}
