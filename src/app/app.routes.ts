import {Routes} from "@angular/router";

import {Dashboard1Component} from "./views/dashboards/dashboard1.component";
import {Dashboard2Component} from "./views/dashboards/dashboard2.component";
import {Dashboard3Component} from "./views/dashboards/dashboard3.component";
import {Dashboard4Component} from "./views/dashboards/dashboard4.component";
import {Dashboard41Component} from "./views/dashboards/dashboard41.component";
import {Dashboard5Component} from "./views/dashboards/dashboard5.component";

import {StarterViewComponent} from "./views/appviews/starterview.component";
import { LoginComponent } from "./login/login.component";

import {BlankLayoutComponent} from "./components/common/layouts/blankLayout.component";
import {BasicLayoutComponent} from "./components/common/layouts/basicLayout.component";
import {TopNavigationLayoutComponent} from "./components/common/layouts/topNavigationlayout.component";
import { AuthGuard } from "./authGuard.service";
import { RegisterComponent } from "./register/register.component";
import { ForgotpasswordComponent } from "./forgotpassword/forgotpassword.component";

export const ROUTES:Routes = [
  // Main redirect
  {path: '', redirectTo: 'recent', pathMatch: 'full', canActivate: [AuthGuard]},

  // App views
  {
    path: '', component: BasicLayoutComponent, canActivate: [AuthGuard],
    children: [
      {path: 'recent', component: StarterViewComponent, canActivate: [AuthGuard]},
      {path: 'courses/:id', component: Dashboard1Component, canActivate: [AuthGuard]},
    ]
  },
  {
    path: 'courses', component: BasicLayoutComponent, canActivate: [AuthGuard],
    children: [
      {path: ':id', component: Dashboard1Component, canActivate: [AuthGuard]},
    ]
  },
  {
    path: '', component: BlankLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      {path: 'register', component: RegisterComponent},
      {path: 'resetpassword', component: ForgotpasswordComponent}
    ]
  },

  // Handle all other routes
  {path: '**',  redirectTo: 'recent'}
];
