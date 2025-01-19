import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor(private http:HttpClient) { }


  onSubmit(form: any) {
    if (form.valid) {
      const { userEmail, password } = form.value;
      console.log('Login Data:', { userEmail, password });
      
      this.http.post('http://localhost:5000/login', { userEmail, password })
        .subscribe({
          next: (response) => {
            console.log('Response from backend:', response);
            
          },
          error: (error) => {
            console.error('Error during login:', error);
        
          }
        });
      
    } else {
      console.log('Form is invalid');
    }
  }

}
