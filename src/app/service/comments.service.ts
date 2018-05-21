import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class CommentsService {

  discussion_id: any;
  uid: any;

  constructor(private db: AngularFireDatabase) { }

  getId(key, uid){
    this.discussion_id = key;
    this.uid = uid; 
  }

  newComments(coment){
    firebase.database().ref().child('/comments/'+this.discussion_id+'/comment_list').push({
      created_by: this.uid,
      created_on: firebase.database.ServerValue.TIMESTAMP,
      comment: coment,
      likes: 0,
    }).then((success)=> {
      console.log(success)
    })
  }

  getComments(){
    return this.db.list('/comments/'+this.discussion_id+'/comment_list').snapshotChanges().map(x => {
      return x.map(y => {
        let val = y.payload.val();
        let key = y.payload.key;
        let a = this.db.object('users/'+val.created_by);
        let b : Observable<any> = a.valueChanges();

        b.subscribe(x => {
          val.display_name = x.display_name;
          val.image = x.image_url;
        })

        return {val,key}
      })
    })
  }
}
