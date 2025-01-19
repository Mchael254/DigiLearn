import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://127.0.0.1:5000/get-attendance';
  private loginUserUrl = 'http://127.0.0.1:5000/login';
  private updateAttendanceUrl = 'http://127.0.0.1:5000/update-attendance';

  constructor(private http: HttpClient) { }

  //user details
  private userDetails: any = null;

  setUserDetails(details: any) {
    this.userDetails = details;
  }

  getUserDetails() {
    return this.userDetails;
  }

  //get citizen list
  getCitizens(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // login
  login(loginData: { Email: string }): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(this.loginUserUrl, loginData, { headers }).pipe(
      catchError((error) => {
        // Use the backend-provided message
        const errorMessage = error.error?.message || 'An unknown error occurred';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  updateUserAttendance(userData: any): Observable<any> {
    return this.http.put(this.updateAttendanceUrl, userData);
  }

  


}
