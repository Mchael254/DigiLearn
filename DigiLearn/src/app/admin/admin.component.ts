import { Component, } from '@angular/core';
import { AdminService } from '../services/admin.service';
import { HttpClient } from '@angular/common/http';
import { throwError } from 'rxjs';
import * as XLSX from 'xlsx';


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
  errorMessage = '';
  qualifiersData: any[] = [];

  currentView = 'citizens';
  setView(view: string): void {
    this.currentView = view;
  }

  ngOnInit(): void {
    this.getCollections();
    this.getCollectionData(this.selectedCollection);
    this.listQualifiers = [];

  }


  //upload file
  collections: any[] = [];
  selectedCollection: any = '';
  newCollectionName: string = '';
  showCreateCollection: boolean = false;
  selectedCollectionToView: string = '';
  collectionData: any[] = [];

  displayKeys: string[] = [];



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
    this.http.get<any[]>(`http://127.0.0.1:5000/getCollectionData/${collectionName}`).subscribe({
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

  //filter data
  qualifiersCount: number = 0;
  listQualifiers: any[] = [];
  filteredData: any[] = [];
  daysFilter: number | null = null;
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

  //normalize data
  normalizedData: any[] = [];
  normalizeData() {
    if (this.collectionData.length > 0) {
      const allKeys = Object.keys(this.collectionData[0]);
      this.displayKeys = allKeys.filter((key) => key !== '_id');

      //email
      const emailKey = this.displayKeys.find((key) => key.toLowerCase().includes('email'));
      if (emailKey) {
        this.displayKeys = this.displayKeys.filter((key) => key !== emailKey);
        this.displayKeys.splice(2, 0, emailKey);
      }

      // Move 'days' to the last position if it exists
      const daysKey = this.displayKeys.find((key) => key.toLowerCase().includes('days'));
      if (daysKey) {
        this.displayKeys = this.displayKeys.filter((key) => key !== daysKey);
        this.displayKeys.push(daysKey); // Add 'days' to the end
      }


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

  }

  //create collection
  uploadError: string = '';
  createCollection() {
    if (this.newCollectionName.trim()) {
      this.http
        .post('http://127.0.0.1:5000/createCollection', { name: this.newCollectionName })
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


  //delete collection
  deleteCollectionName: string = '';
  deleteSuccess: boolean = false;
  deleteCollection() {
    this.deleteCollectionName = this.selectedCollection;
    if (this.deleteCollectionName.trim()) {
      this.http
        .delete('http://127.0.0.1:5000/deleteCollection', { params: { name: this.deleteCollectionName } })
        .subscribe({
          next: (response) => {
            console.log('Collection deleted:', response);
            this.getCollections();
            this.normalizedData = [];
            this.filteredData = [];
            this.showCreateCollection = false;
            this.selectedCollection = '';
            this.selectedCollectionToView = '';
            this.clearFilter();
            this.listQualifiers = [];
            this.deleteSuccess = true;
            setTimeout(() => {
              this.deleteSuccess = false;
            }, 1000);
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
    this.files = [];
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
      this.http.post('http://127.0.0.1:5000/uploadFiles', formData).subscribe({
        next: (response) => {
          console.log('Files uploaded successfully:', response);
          this.status = "success";
          setTimeout(() => {
            this.status = 'initial';
            this.currentView = 'citizens';
            this.files = [];
          }, 2000);

        },
        error: (error) => {
          console.error('Files upload failed:', error);
          this.status = 'fail';
          this.uploadError = error.error.message;
          // this.files = [];
          setTimeout(() => {
            this.status = 'initial';
            this.files = [];
            this.uploadError = '';
          }, 4000);

        }
      });
    }
  }

  //download excel files
  noDownloadData: boolean = false;
  downloadQualifiers() {
    if (this.listQualifiers.length === 0) {
      this.noDownloadData = true;
      setTimeout(() => {
        this.noDownloadData = false;
      }, 2000);
      return;
    }
    const data = this.listQualifiers;
    const columns = this.getColumns(data);
    const worksheet = XLSX.utils.json_to_sheet(data, { header: columns });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Qualifiers');
    XLSX.writeFile(workbook, 'qualifiers.xlsx');

  }

  getColumns(data: any) {
    const columns: string[] = [];
    data.forEach((record: any) => {
      for (const key in record) {
        if (!columns.includes(key)) {
          columns.push(key);
        }
      }

    });
    return columns;
  }



}
