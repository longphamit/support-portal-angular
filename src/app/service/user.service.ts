import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpEvent, HttpResponse} from "@angular/common/http"
import {environment} from "../../environments/environment"
import { Observable } from 'rxjs';
import { User } from '../model/user';
import { CustomHttpResponse } from '../model/custom-http-response';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private host=environment.apiUrl
  constructor(private http:HttpClient) { }
  public getUsers():Observable<User[]>{
    return this.http.get<User[]>(`${this.host}/user/list`)
  }
  public addUser(formData:FormData):Observable<User>{
    return this.http.post<User>(`${this.host}/user/add`,formData)
  }
  public updateUser(formData:FormData):Observable<User>{
    return this.http.post<User>(`${this.host}/user/update`,formData)
  }
  public resetPassword(email:string):Observable<CustomHttpResponse>{
    return this.http.get<CustomHttpResponse>(`${this.host}/user/reset-password/${email}`)
  }
  public updateProfileImage(formData:FormData):Observable<HttpEvent<any>>{
    return this.http.post<HttpEvent<any>>(`${this.host}/user/updateProfileImage`,formData,
    {
      reportProgress:true,
      observe:'events'
    });
  }
  public deleteUser(userId:number):Observable<CustomHttpResponse|HttpErrorResponse>{
    return this.http.delete<CustomHttpResponse>(`${this.host}/user/delete/${userId}`)
  }
  public addUsersToLocalCache(users:User[]):void{
    localStorage.setItem('users',JSON.stringify(users))
  }
  public getUsersFromLocalCache():User[]{
   return JSON.parse(localStorage.getItem('users')||'{}')
  }
  public createUserFormData(currentUsername:string,user:User,profileImage:File):FormData{
    const formData=new FormData();
    currentUsername?formData.append("currentUsername",currentUsername):null
    formData.append("firstName",user.firstName);
    formData.append("lastName",user.lastName);
    formData.append("username",user.username);
    formData.append("email",user.email);
    formData.append("role",user.roles);
    formData.append("isActive",JSON.stringify(user.active));
    formData.append("isNonLocked",JSON.stringify(user.notLocked));
    if(profileImage){
      formData.append("profileImage",profileImage);
    }
    return formData;
  }
}
