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

  currentView = 'citizens';
  setView(view: string): void {
    this.currentView = view;
    this.getCitizens();
  }

  ngOnInit(): void {
    this.getCitizens();
    this.getCollections();
  }


  //upload file
  status: "initial" | "uploading" | "success" | "fail" = "initial";
  files: File[] = [];
  collections: any[] = [];
  selectedCollection: any = '';
  viewCollection: any = '';
  newCollectionName: string = '';
  showCreateCollection: boolean = false;
  selectedCollectionToView: string = '';
  collectionData: any[] = [];

  getCollections() {
    this.attendanceService.getCollections().subscribe({
      next: (response) => {
        this.collections = response;
        console.log('Collections loaded:', this.collections);
        if (this.collections.length > 0) {
          this.selectedCollection = this.collections[0];
        }
      },
      error: (error) => {
        console.error('Error fetching collections:', error);
      }
    })

  }
  getCollectionData(collectionName: string) {
    this.http.get<any[]>(`http://localhost:5000/getCollectionData/${collectionName}`).subscribe({
      next: (response) => {
        this.collectionData = response;
        console.log('Collection data loaded:', this.collectionData);
      },
      error: (error) => {
        console.error('Failed to fetch collection data:', error);
      }
    });
  }


  createCollection() {
    if (this.newCollectionName.trim()) {
      this.http
        .post('http://localhost:5000/createCollection', { name: this.newCollectionName })
        .subscribe({
          next: (response) => {
            console.log('Collection created:', response);
            this.getCollections(); // Refresh collections
            this.newCollectionName = ''; // Clear input
            this.showCreateCollection = false; // Hide form
          },
          error: (error) => {
            console.error('Failed to create collection:', error);
          }
        });
    }
  }


  onFilesSelected(event: any) {
    const selectedFiles: FileList = event.target.files;
    this.files = Array.from(selectedFiles);
  }


  removeFile(index: number) {
    this.files.splice(index, 1);
  }

  // onCollectionChange() {
  //   if (this.selectedCollection) {
  //     console.log(`Selected collection: ${this.selectedCollection}`);
  //   }
  // }

  onUpload() {
    if (this.files.length > 0 && this.selectedCollection) {
      const formData = new FormData();
      this.files.forEach((file) => formData.append('files', file, file.name));
      formData.append('collection', this.selectedCollection);

      this.status = 'uploading';
      this.http.post('http://localhost:5000/uploadFiles', formData).subscribe({
        next: (response) => {
          console.log('Files uploaded successfully:', response);
          this.status = 'success';
          this.files = [];
        },
        error: (error) => {
          console.error('Files upload failed:', error);
          this.status = 'fail';
        }
      });
    }
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
