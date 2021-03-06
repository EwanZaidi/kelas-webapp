import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app';
import { Upload } from './upload.model';
import { UploadService } from './upload.service';
import * as _ from 'lodash';
import * as moment from 'moment';

@Injectable()
export class DiscussionService {

  discuss: AngularFireList<any>;
  discuss$: Observable<any>;

  cid: any;
  files: any;
  uploading:any;
  dis_id: any;

  constructor(private db: AngularFireDatabase, private uploadService: UploadService) {

  }

  getId(course_id){
    this.cid = course_id;
  }

  createDiscussionWithFile(title, description, file,dis_id, user_id){
    this.files = file;
    this.dis_id = dis_id;
    let a = firebase.database().ref().child('discussion/'+this.cid+'/discussion_list').push({
      title: title,
      description: description,
      created_by: user_id,
      created_on: firebase.database.ServerValue.TIMESTAMP,
    })

    this.uploadFiles(a);
  }

  uploadFiles(a) {
    console.log(a.key);
    const filesToUpload = this.files;
    const filesIndex = _.range(filesToUpload.length);
    _.each(filesIndex, (idx) => {
      this.uploading = new Upload(filesToUpload[idx]);
      this.uploadService.uploadFile2(this.uploading,a.key,this.dis_id);
    });
  }

  createDiscussion(title, description, user_id){
    let a = firebase.database().ref().child('discussion/'+this.cid+'/discussion_list').push({
      title: title,
      description: description,
      created_by: user_id,
      created_on: firebase.database.ServerValue.TIMESTAMP,
    })
  }

  getDicussion(uid){
    return this.db.list('discussion/'+this.cid+'/discussion_list').snapshotChanges().map(x => {
      return x.map(y => {
        const val = y.payload.val();
        const key = y.payload.key;

        if(val.created_by == uid){
          val.creator = true;
        }else{
          val.creator = false;
        }
        
        val.sendTime = moment(val.created_on).fromNow();

        let comments = this.db.list('comments/'+ key +'/comment_list').valueChanges();

        let user = this.db.object('users/' + val.created_by);
        let user$ = user.snapshotChanges().map((u) => {
          const data = u.payload.val();
          const key = u.payload.key;

          return {data,key}
        })

        return {val,key,comments,user$}
      })
    });
  }

}
