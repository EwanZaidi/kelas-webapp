import { Component, OnInit, AfterViewInit, ChangeDetectionStrategy,} from '@angular/core';
import { CalendarEvent } from 'angular-calendar';
import { Observable } from 'rxjs/Observable';
import { Subject} from 'rxjs';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours
} from 'date-fns';
import {map} from 'lodash';

declare var jQuery:any;

interface Film {
  name: string;
  title: string;
  release_date: string;
}

const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3'
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF'
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA'
  }
};


@Component({
  selector: 'dashboard2',
  templateUrl: 'dashboard2.template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class Dashboard2Component implements OnInit, AfterViewInit{

  view: string = 'month';

  activeDayIsOpen: boolean = false;

  viewDate: Date = new Date();

  events: CalendarEvent[] = [];

  clickedDate: Date;

  uid: any;

  event: Observable<any>;

  refresh: Subject<any> = new Subject();

  constructor(private db: AngularFireDatabase, private afAuth: AngularFireAuth){
    this.afAuth.authState.subscribe((x) => {
      this.uid = x.uid;

      this.event = this.db.list('task/'+this.uid+'/task_list').valueChanges();

      this.event.subscribe(x => {
        x.forEach(y => {
          let date = new Date(y.date * 1000);
          console.log(date);
          
          this.events.push({
            title: y.name+' '+y.description,
            color: colors.red,
            start: new Date(date)
          });

          this.refresh.next()
          
        })
      })
    })
    
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
        this.viewDate = date;
      }
    }
  }

  eventClicked({ event }: { event: CalendarEvent }): void {
    console.log('Event clicked', event);
  }

  ngOnInit(){ }

  ngAfterViewInit(){}


}
