import { Injectable } from '@angular/core';
import { AngularFireList, AngularFireObject, AngularFireDatabase } from 'angularfire2/database';
import { GalleryImage } from './gallery.model';
import { AngularFireAuth } from 'angularfire2/auth';
import { Upload } from './upload.model';
import * as firebase from 'firebase';

@Injectable()
export class UploadService {

  private basePath = '/profile';
  private uploads: AngularFireList<GalleryImage[]>;
  image: AngularFireObject<GalleryImage>;
  userId: string;
  key:any;
  dis_id: any;

  ckey: any;

  constructor(private db: AngularFireDatabase, private afAuth: AngularFireAuth) {
    this.afAuth.authState.subscribe(user => {
      if (user) this.userId = user.uid
    });
  }

  uploadFile(upload: Upload) {
    const storageRef = firebase.storage().ref();
    const uploadTask = storageRef.child(`${this.basePath}/` + this.userId + `/${upload.file.name}`)
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
        this.saveFileData(upload)
      });
  }

  private saveFileData(upload: Upload) {
    this.db.object(`users/` + this.userId).update({ image_url: upload.image_url })
  }

  uploadFile3(upload: Upload, key) {
    const storageRef = firebase.storage().ref();
    const uploadTask = storageRef.child(`/courses/course_list/${key}/${upload.file.name}`)
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
        this.saveFileData3(upload, key)
      });
  }

  private saveFileData3(upload: Upload, key) {
    this.db.object(`/courses/course_list/${key}`).update({ image_url: upload.image_url })
  }

  uploadFile2(upload: Upload, key, dis_id) {
    this.key = key;
    this.dis_id = dis_id;
    const storageRef = firebase.storage().ref();
    const uploadTask = storageRef.child(`discussion/${this.dis_id}/discussion_list/${this.key}/${upload.file.name}`)
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
        this.saveFileData2(upload)
      });
  }

  uploadMaterial(upload: Upload, c_key, uid){
    this.userId = uid;
    this.ckey = c_key;
    const storageRef = firebase.storage().ref();
    const uploadTask = storageRef.child(`materials/${c_key}/${upload.file.name}`).put(upload.file);

    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
      (snapshot) => {
        upload.progress = (uploadTask.snapshot.bytesTransferred / uploadTask.snapshot.totalBytes) * 100;
        upload.display = Math.round(upload.progress);
        let snap = snapshot as firebase.storage.UploadTaskSnapshot;
      },

      (error) => {
        console.log(error);
      },

      (): any => {
        uploadTask.snapshot.ref.getDownloadURL().then((u) => {
          upload.url = u;
        }).then(() => {
          upload.name = upload.file.name; 
          this.saveMaterial(upload);
        })
      }
    )
  }

  private saveFileData2(upload: Upload) {
    this.db.object(`discussion/` + this.dis_id +'/discussion_list/'+this.key).update({ image: upload.image_url })
  }

  private saveMaterial(upload: Upload) {
    firebase.database().ref(`materials/${this.ckey}/`).push({
      name: upload.name,
      url: upload.url,
      created_on: firebase.database.ServerValue.TIMESTAMP,
      created_by: this.userId
    })
  }

}
