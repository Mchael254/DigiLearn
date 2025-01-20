import { Component } from '@angular/core';
import { AdminService } from '../services/admin.service';
import { HttpClient } from '@angular/common/http';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent {

  constructor(private attendanceService: AdminService, private http: HttpClient) { }
  citizensPanel = false;
  uploadPanel = false;
  selectedFile: File | null = null; 
  message: string = ''; 


  //data
  citizensData: any[] = [];
  errorMessage = '';
  qualifiersData: any[] = [];

  currentView = 'upload';
  setView(view: string): void {
    this.currentView = view;
    this.getCitizens();
  }

  status: "initial" | "uploading" | "success" | "fail" = "initial"; 
  file: File | null = null; 

  onChange(event: any) {
    const file: File = event.target.files[0];

    if (file) {
      this.status = "initial";
      this.file = file;
    }
  }

  onUpload() {
    if (this.file) {
      const formData = new FormData();

      formData.append('file', this.file, this.file.name);
      console.log('File uploaded:', this.file);


      this.status = 'uploading';
      this.http.post('http://localhost:5000/uploadFile', formData).subscribe({
        next: (response) => {
          console.log('File uploaded successfully:', response);
          this.status = 'success';
          this.getCitizens();
          this.currentView = 'citizens';

        },
        error: (error) => {
          console.error('File upload failed:', error);
          this.status = 'fail';
        }
      });


    }
  }


  ngOnInit(): void {
    this.getCitizens();
  }

  //show attendance panel
  getCitizens() {
    this.attendanceService.getCitizens().subscribe({
      next: (response) => {
        this.citizensData = response.data; 
        console.log('Attendance data loaded:', this.citizensData);
        this.filterQualifiers();
      },
      error: (error) => {
        this.errorMessage = 'Failed to load attendance data.';
        console.error('Error fetching attendance:', error);
      }
    });


  }

  //Qualifiers
  filterQualifiers() {
    this.qualifiersData = this.citizensData.filter(record => record.days >= 3);
  }
 

}
