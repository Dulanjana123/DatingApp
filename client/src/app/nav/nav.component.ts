import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs/internal/Observable';
import { User } from '../_models/user';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  //create class property to store what user entered into the form
  model: any = {}

//inject member service
  constructor(public accountService: AccountService, private router: Router, 
    private toastr: ToastrService) { }

  ngOnInit(): void {
  }

  login() {
    this.accountService.login(this.model).subscribe(response => {
      this.router.navigateByUrl('/members');
      //afterlogged in successfully, reset the userParams 
    })
    // , error => {
    //   console.log(error);
    //   this.toastr.error(error.error);
    // })
  }

  logout() {
    this.accountService.logout();
    this.router.navigateByUrl('/')
  }  


}
