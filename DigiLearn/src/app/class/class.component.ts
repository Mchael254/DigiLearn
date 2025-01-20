import { Component } from '@angular/core';
import { AdminService } from '../services/admin.service';
import { first } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-class',
  templateUrl: './class.component.html',
  styleUrls: ['./class.component.css']
})
export class ClassComponent {
  constructor(private authService: AdminService, private router: Router) { }

  userDetails: any;

  ngOnInit() {
    this.userDetails = this.authService.getUserDetails();

  }
 
  progressBar() {
    if(!this.userDetails){
      this.router.navigate(['/login']);
      return ;
    }
    const totalDays = 3;
    return Math.min(this.userDetails.days / totalDays * 100, 100);

  }

  attendDay(day: number) {
    if (!this.userDetails) {
      this.router.navigate(['/login']);
      return;
    }
  
    const dayMapping: { [key: number]: string } = {
      1: 'day1',
      2: 'day2',
      3: 'day3',
    }

    if (dayMapping[day]) {
      this.userDetails[dayMapping[day]]++;
    }

    this.userDetails.days++;

    let userData = {
      Email: this.userDetails.Email,
      FirstName: this.userDetails.FirstName,
      LastName: this.userDetails.LastName,
      day1: this.userDetails.day1,
      day2: this.userDetails.day2,
      day3: this.userDetails.day3,
      days: this.userDetails.days
    };

    // console.log(userData);
    this.authService.updateUserAttendance(userData)
      .pipe(first())
      .subscribe(
        data => {
          console.log(data);
          this.authService.setUserDetails(userData);
          this.userDetails = userData;
        },
        error => {
          console.log(error);
        }
      );

  }

}
