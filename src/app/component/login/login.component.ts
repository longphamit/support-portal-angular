import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificationType } from 'src/app/enum/notification-type.enum';
import { User } from 'src/app/model/user';
import { AuthenticationService } from 'src/app/service/authentication.service';
import { NotificationService } from 'src/app/service/notification.service';
import {HeaderType} from "../../enum/header-type.enum"
import {FormGroup,FormBuilder, Validators, FormControl} from "@angular/forms"
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  private subsciptions:Subscription[]=[];
  loading:boolean=false;
  submitCheck:boolean=false;
  loginForm:FormGroup;
  constructor(
    private formBuilder:FormBuilder,
    private router: Router,
    private authenticationService: AuthenticationService,
    private notificationService: NotificationService
  ) { }
  
  ngOnInit(): void {
    console.log(this.authenticationService.isLogin())
    if(this.authenticationService.isLogin()){
      this.router.navigateByUrl("user/mangement")
    }else{
      this.loginForm= this.formBuilder.group({
        username:new FormControl('',[Validators.required]),
        password:new FormControl('',[Validators.required])
      })
    }
   
  }

  ngOnDestroy(): void {
    this.subsciptions.forEach(sub=>sub.unsubscribe())
  }
  private sendErrorNotification(notificationType:NotificationType,message:string){
    if(message){
      this.notificationService.notify(notificationType,message);
    }else{
      this.notificationService.notify(notificationType,"AN ERROR OCCURED. PLEASE TRY AGAIN");
    }
  }
  public onLogin():void{
    if(this.loginForm.valid){
      let user:User=this.loginForm.value
      this.loading=true
      this.subsciptions.push(
        this.authenticationService.login(user).subscribe(
          (response:HttpResponse<any>)=>{
            const token=response.headers.get(HeaderType.JWT_TOKEN)
            this.authenticationService.saveToken(token)
            this.authenticationService.addUserToLocalCache(response.body);
            this.router.navigateByUrl('user/management');
            this.loading=false;
          },
          (errorResponse:HttpErrorResponse)=>{
            console.log(errorResponse.error)
            this.sendErrorNotification(NotificationType.ERROR,errorResponse.error.message)
            this.loading=false;
          }
        )
      );
    }else{
      this.submitCheck=true;
    }
    
    
  }


}
