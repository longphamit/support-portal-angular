import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { NotificationType } from 'src/app/enum/notification-type.enum';
import { User } from 'src/app/model/user';
import { AuthenticationService } from 'src/app/service/authentication.service';
import { NotificationService } from 'src/app/service/notification.service';
import {UserService} from "src/app/service/user.service"
@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  private titleSubject= new BehaviorSubject<string>('Users');
  public titleAcion$=this.titleSubject.asObservable();
  public userSelected:User=new User();
  public users:User[];
  public refreshing:boolean;
  private subscriptions:Subscription[]=[]
  public addUserForm:FormGroup
  public updateUserForm:FormGroup
  public addSubmitCheck:boolean=false
  public fileName:string
  public files:FileList
  public currentUsername:string
  constructor(private autthenticationService:AuthenticationService,
              private userService:UserService,
              private router:Router,
              private formBuilder:FormBuilder,
              private notificationService:NotificationService) { }
  public changeTitle(title:string){
    this.titleSubject.next(title)
  }
  public getEmail():string{
   return this.autthenticationService.getUserFromLocalCache().email;
  }
  public getLastName():string{
    return this.autthenticationService.getUserFromLocalCache().lastName;
  }
  private sendNotification(notificationType:NotificationType,message:string){
    if(message){
      this.notificationService.notify(notificationType,message);
    }else{
      this.notificationService.notify(notificationType,"AN ERROR OCCURED. PLEASE TRY AGAIN");
    }
  }
  public logout():void{
    this.autthenticationService.logOut();
    this.router.navigateByUrl("");
  }
  public getUser(showNotification:boolean):void{
    this.refreshing = true;
    this.subscriptions.push(
      this.userService.getUsers().subscribe(
        (response: User[]) => {
          this.userService.addUsersToLocalCache(response);
          this.users = response;
          this.refreshing = false;
          if (showNotification) {
            this.sendNotification(NotificationType.SUCCESS, `${response.length} user(s) loaded successfully.`);
          }
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
          this.refreshing = false;
        }
      )
    );
  }
  ngOnInit(): void {
    this.addUserForm=this.formBuilder.group({
      firstName:new FormControl('',[Validators.required]),
      lastName:new FormControl('',[Validators.required]),
      username:new FormControl('',[Validators.required]),
      email:new FormControl('',[Validators.required]),
      roles:new FormControl(''),
      profileImage:new FormControl(null,[Validators.required]),
      active:new FormControl('',[Validators.required]),
      notLocked:new FormControl('',[Validators.required])
    })
    this.updateUserForm=this.formBuilder.group({
      firstName:new FormControl('',[Validators.required]),
      lastName:new FormControl('',[Validators.required]),
      username:new FormControl('',[Validators.required]),
      email:new FormControl('',[Validators.required]),
      roles:new FormControl(''),
      profileImage:new FormControl(null),
      active:new FormControl('',[Validators.required]),
      notLocked:new FormControl('',[Validators.required])
    })
    this.getUser(true);
    
  }
  public setUserSelected(user:User):void{
    this.userSelected=user
    this.currentUsername=user.username
  }
  public addUser():void{
    this.addSubmitCheck=true;
  }
  public onProfileImageChanged(event:any):void{
    const target=event.target as HTMLInputElement;
    this.files=target.files;
    this.fileName=this.files[0].name
    console.log(this.files)
  }
  public saveNewUser(): void{
    if(this.addUserForm.valid){
        const user:User=this.addUserForm.value
        const formData:FormData =  this.userService.createUserFormData(
          null,
          user,
          this.files[0])
          console.log(this.files[0])
          console.log(user)
          console.log(this.userService.getUsersFromLocalCache()[0].username)
          this.subscriptions.push(
            this.userService.addUser(formData).subscribe((response:User)=>{
              this.fileName=""
              this.files=null
              this.addUserForm.reset()
              this.getUser(false)
              this.notificationService.notify(NotificationType.SUCCESS,"Đã thêm 1 user")
            },(error:HttpErrorResponse)=>{
              this.notificationService.notify(NotificationType.ERROR,"Thêm 1 user thất bại")
            })
          )
    }
  }
  public updateUser(): void{
    if(this.updateUserForm.valid){
      const user:User=this.updateUserForm.value
      const form:FormData=this.userService.createUserFormData(
        this.currentUsername,
        user,
        this.files?this.files[0]:null
      )
      this.subscriptions.push(
        this.userService.updateUser(form).subscribe((response:User)=>{
          this.fileName=""
          this.files=null
          this.addUserForm.reset()
          this.getUser(false)
          this.notificationService.notify(NotificationType.SUCCESS,"Đã update user")
        },(error:HttpErrorResponse)=>{
          this.notificationService.notify(NotificationType.ERROR,"Thêm 1 user thất bại")
        })
      )
    }
  }
}