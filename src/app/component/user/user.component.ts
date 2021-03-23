import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
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
  public users:User[];
  public refreshing:boolean;
  private subscriptions:Subscription[]=[]
  constructor(private autthenticationService:AuthenticationService,
              private userService:UserService,
              private router:Router,
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
    this.getUser(true);
  }

}
