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
  private getCollectionsUrl = 'https://class-attendance-m0jh.onrender.com/getCollections'

  //render api's
  private renderCreateCollectionUrl = 'https://class-attendance-m0jh.onrender.com/createCollection';
  private renderGetCollectionsUrl = 'https://class-attendance-m0jh.onrender.com/getCollections';
  private renderGetCollectionDataUrl = 'https://class-attendance-m0jh.onrender.com/getCollectionData';
  private renderUploadFileUrl = 'https://class-attendance-m0jh.onrender.com/uploadFiles';
  private renderDeleteCollectionUrl = 'https://class-attendance-m0jh.onrender.com/deleteCollection';

  renderGetCollections(): Observable<any> {
    return this.http.get<any>(this.renderGetCollectionsUrl);
  }

  renderGetCollectionData(collectionName: string): Observable<any> {
    return this.http.get<any>(`${this.renderGetCollectionDataUrl}/${collectionName}`);
  }

  renderUploadFile(formData: FormData): Observable<any> {
    return this.http.post(this.renderUploadFileUrl, formData);
  }

  renderCreateCollection(collectionName: string): Observable<any> {
    return this.http.post(this.renderCreateCollectionUrl, { collectionName });
  }

  renderDeleteCollection(collectionName: string): Observable<any> {
    return this.http.delete(`${this.renderDeleteCollectionUrl}/${collectionName}`);
  }

  constructor(private http: HttpClient) { }

  //user details
  private userDetails: any = null;

  setUserDetails(details: any) {
    this.userDetails = details;
  }

  getUserDetails() {
    return this.userDetails;
  }

  //get collections
  getCollections(): Observable<any> {
    return this.http.get<any>(this.getCollectionsUrl);
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
