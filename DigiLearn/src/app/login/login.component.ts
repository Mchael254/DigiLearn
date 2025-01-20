import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AdminService } from '../services/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor(private http:HttpClient, private authService:AdminService, private router:Router) { }

  loginError:string = '';
  Email:string = '';

  onSubmit() {
      if (this.Email == '') {
        this.loginError = 'Email cannot be empty';
        setTimeout(() => {
          this.loginError = '';
        }, 3000);
        return;  
      }
  
      const loginData = {
        Email: this.Email
      };
  
      console.log(loginData);
  
      this.authService.login(loginData).subscribe(
        (response) => {
          console.log(response);
          this.authService.setUserDetails(response.details);
          this.router.navigate(['/class']);
        },
        (error) => {
          console.error(error);
          this.loginError = error.message || 'An unknown error occurred';
          setTimeout(() => {
            this.loginError = '';
          }, 3000);
        }
      );  
  
   
  }




}
