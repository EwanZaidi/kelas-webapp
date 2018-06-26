import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import {RouterModule} from "@angular/router";

import { PopoverModule } from 'ngx-bootstrap/popover';

import {ROUTES} from "./app.routes";
import { AppComponent } from './app.component';

// App views
import {DashboardsModule} from "./views/dashboards/dashboards.module";
import {AppviewsModule} from "./views/appviews/appviews.module";

// App modules/components
import {LayoutsModule} from "./components/common/layouts/layouts.module";
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

//Angular Fire
import {AngularFireModule} from 'angularfire2';
import {AngularFireAuthModule} from 'angularfire2/auth';
import {AngularFireDatabaseModule} from 'angularfire2/database';

//environment
import { environment } from '../environments/environment';
import { AuthService } from './auth.service';
import { AuthGuard } from './authGuard.service';
import { SafePipeModule } from 'safe-pipe';

//module
// import { CalendarModule } from 'angular-calendar';
// import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';

//layout
import {BsDropdownModule, ModalModule} from 'ngx-bootstrap';

import {BasicLayoutComponent} from "./components/common/layouts/basicLayout.component";
import {BlankLayoutComponent} from "./components/common/layouts/blankLayout.component";
import {TopNavigationLayoutComponent} from "./components/common/layouts/topNavigationlayout.component";

import {NavigationComponent} from "./components/common/navigation/navigation.component";
import {FooterComponent} from "./components/common/footer/footer.component";
import {TopNavbarComponent } from './components/common/topnavbar/topnavbar.component';
import {TopNavigationNavbarComponent} from "./components/common/topnavbar/topnavigationnavbar.component";
import { ForgotpasswordComponent } from './forgotpassword/forgotpassword.component';
import { Dashboard1Component } from './views/dashboards/dashboard1.component';
import { UploadService } from './service/upload.service';
import { DiscussionService } from './service/discussion.service';
import { CommentsService } from './service/comments.service';
import { StarterViewComponent } from './views/appviews/starterview.component';
import { DashboardService } from './service/dashboard.service';

//ngb
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CalendarModule } from 'angular-calendar';
import { Dashboard2Component } from './views/dashboards/dashboard2.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { PdfViewerModule } from 'ng2-pdf-viewer';
import { DocumentViewModule } from 'ngx-document-view';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    TopNavbarComponent,
    BasicLayoutComponent,
    BlankLayoutComponent,
    TopNavigationLayoutComponent,
    NavigationComponent,
    FooterComponent,
    TopNavigationNavbarComponent,
    ForgotpasswordComponent,
    Dashboard1Component,
    StarterViewComponent,
    Dashboard2Component
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    DashboardsModule,
    LayoutsModule,
    AppviewsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(ROUTES),
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    BsDropdownModule.forRoot(),
    ModalModule.forRoot(),
    PopoverModule.forRoot(),
    BsDatepickerModule.forRoot(),
    CalendarModule.forRoot(),
    BrowserAnimationsModule,
    PdfViewerModule,
    DocumentViewModule,
    SafePipeModule
  ],
  providers: [AuthService, AuthGuard, UploadService, DiscussionService, CommentsService, DashboardService],
  bootstrap: [AppComponent],
  exports:[
    TopNavbarComponent,
    BasicLayoutComponent,
    BlankLayoutComponent,
    TopNavigationLayoutComponent,
    NavigationComponent,
    FooterComponent,
    TopNavigationNavbarComponent,
    Dashboard1Component,
    StarterViewComponent,
    Dashboard2Component
  ]
})
export class AppModule { }
