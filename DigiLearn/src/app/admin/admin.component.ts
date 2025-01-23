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
  collections: any[] = [];
  selectedCollection: any = '';
  viewCollection: any = '';
  newCollectionName: string = '';
  showCreateCollection: boolean = false;
  selectedCollectionToView: string = '';
  collectionData: any[] = [];
  normalizedData: any[] = [];
  displayKeys: string[] = [];
  filteredData: any[] = [];
  daysFilter: number | null = null;


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
        this.normalizeData();
      },
      error: (error) => {
        console.error('Failed to fetch collection data:', error);
      }
    });
  }

  qualifiersCount: number = 0;
  listQualifiers: any[] = [];
  filterData() {
    if (this.daysFilter !== null) {
      this.filteredData = this.normalizedData.filter(record => record.days === this.daysFilter);
      this.qualifiersCount = this.filteredData.length;
      this.listQualifiers = this.filteredData;
    } else {

      this.filteredData = this.normalizedData;


    }
  }

  clearFilter() {
    this.daysFilter = null;
    this.filteredData = this.normalizedData;
    this.listQualifiers = [];
    this.qualifiersCount = 0

  }

  normalizeData() {
    if (this.collectionData.length > 0) {
      const allKeys = Object.keys(this.collectionData[0]);
      this.displayKeys = allKeys.filter((key) => key !== '_id');

      this.normalizedData = this.collectionData.map((record) => {
        const normalizedRecord: any = {};
        for (const key of this.displayKeys) {
          normalizedRecord[key] = record[key];
        }
        return normalizedRecord;
      });
      this.filterData();
    } else {
      this.normalizedData = [];
      this.displayKeys = [];
    }
    console.log('Normalized Data:', this.normalizedData);
    console.log('Display Keys:', this.displayKeys);
  }

  uploadError: string = '';
  createCollection() {
    if (this.newCollectionName.trim()) {
      this.http
        .post('http://localhost:5000/createCollection', { name: this.newCollectionName })
        .subscribe({
          next: (response) => {
            console.log('Collection created:', response);
            this.getCollections();
            this.newCollectionName = '';
            this.showCreateCollection = false;
          },
          error: (error) => {
            console.error('Failed to create collection:', error);
            this.uploadError = error.error.message;
            setTimeout(() => {
               this.uploadError = ''
            
            }, 4000);
           
            
            
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

  //upload files
  status: "initial" | "uploading" | "success" | "fail" = "initial";
  files: File[] = [];
  onUpload() {
    if (this.files.length > 0 && this.selectedCollection) {
      const formData = new FormData();
      this.files.forEach((file) => formData.append('files', file, file.name));
      formData.append('collection', this.selectedCollection);
      this.status = 'uploading';
      this.uploadError = '';
      this.http.post('http://localhost:5000/uploadFiles', formData).subscribe({
        next: (response) => {
          console.log('Files uploaded successfully:', response);
          alert('Files uploaded successfully');
          this.status = "success";
          setTimeout(() => {
            this.status = 'initial';
            this.currentView = 'citizens';
          }, 3000);
          
        },
        error: (error) => {
          console.error('Files upload failed:', error);
          this.status = 'fail';
          this.uploadError = error.error.message;

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
