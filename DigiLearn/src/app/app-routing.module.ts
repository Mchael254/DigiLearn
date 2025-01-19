import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserComponent } from './user/user.component';
import { LoginComponent } from './login/login.component';
import { AdminComponent } from './admin/admin.component';
import { TrialComponent } from './trial/trial.component';
import { ClassComponent } from './class/class.component';

const routes: Routes = [
  {path:'',redirectTo:'/user',pathMatch:'full'},
  { path:'user',component: UserComponent},
  { path:'login',component: LoginComponent},
  { path:'admin',component: AdminComponent},
  { path:'trial',component: TrialComponent},
  { path:'class',component: ClassComponent},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
