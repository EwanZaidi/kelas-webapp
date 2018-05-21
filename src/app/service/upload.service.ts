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

  uploadFile2(upload: Upload, key, dis_id) {
    this.key = key;
    this.dis_id = dis_id;
    const storageRef = firebase.storage().ref();
    const uploadTask = storageRef.child(`discussion/` + this.dis_id + `/discussion_list/` +this.key+`/${upload.file.name}`)
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

  private saveFileData2(upload: Upload) {
    this.db.object(`discussion/` + this.dis_id +'/discussion_list/'+this.key).update({ image: upload.image_url })
  }

}
