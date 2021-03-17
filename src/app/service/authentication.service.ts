import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpResponse} from "@angular/common/http"
import {environment} from "../../environments/environment"
import { Observable } from 'rxjs';
import { User } from '../model/user';
import { JwtHelperService } from "@auth0/angular-jwt";
@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  public host=environment.apiUrl;
  private token:string="";
  private loggedInUsername:string="";
  private jwtHelper = new JwtHelperService();
  constructor(private http:HttpClient) {}
  public login(user:User):Observable<HttpResponse<any>|HttpErrorResponse>{
    return this.http.post<HttpResponse<any>|HttpErrorResponse>
    (`${this.host}/user/login`,user)
  }
  public register(user:User):Observable<HttpResponse<any>|HttpErrorResponse>{
    return this.http.post<HttpResponse<any>|HttpErrorResponse>
    (`${this.host}/user/register`,user)
  }
  public logOut():void{
    this.token="";
    this.loggedInUsername="";
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('users');
  }
  public saveToken(token:string):void{
    this.token=token;
    localStorage.setItem('token',token);

  }
  public addUserToLocalCache(user:User):void{
    localStorage.setItem('user',JSON.stringify(user));
  }
  public getUserFromLocalCache():User{
    return JSON.parse(localStorage.getItem('user')||'{}');
  }
  public loadToken():void{
    this.token=localStorage.getItem('token')||'';
  }
  public getToken():string{
    return this.token;
  }
  public isLogin():boolean{
    this.loadToken();
    if(this.token){
      if(this.jwtHelper.decodeToken(this.token).sub){
        if(!this.jwtHelper.isTokenExpired(this.token)){
          this.loggedInUsername=this.jwtHelper.decodeToken(this.token).sub;
          return true;
        }
      }
    }else{
      this.logOut();
    }
    return false;
  }
}
