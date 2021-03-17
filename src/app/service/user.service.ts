import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpResponse} from "@angular/common/http"
import {environment} from "../../environments/environment"
import { Observable } from 'rxjs';
import { User } from '../model/user';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private host=environment.apiUrl;
  constructor(private http:HttpClient) { }
  public getUsers():Observable<User[]|HttpErrorResponse>{
    return this.http.get<User[]>(`${this.host}/user/list`);
  }
  public addUser(formData:FormData):Observable<User|HttpErrorResponse>{
    return this.http.post<User>(`${this.host}/user/add`,formData);
  }
  public updateUser(formData:FormData):Observable<User|HttpErrorResponse>{
    return this.http.post<User>(`${this.host}/user/update`,formData);
  }
}
