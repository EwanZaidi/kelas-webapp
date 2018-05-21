import { Component } from '@angular/core';
import { smoothlyMenu } from '../../../app.helpers';
import { AuthService } from '../../../auth.service';
declare var jQuery:any;

@Component({
  selector: 'topnavbar',
  templateUrl: 'topnavbar.template.html'
})
export class TopNavbarComponent {

  constructor(public authService:AuthService){

  }

  toggleNavigation(): void {
    jQuery("body").toggleClass("mini-navbar");
    smoothlyMenu();
  }

  signOut(){
    this.authService.logout();
  }

}
