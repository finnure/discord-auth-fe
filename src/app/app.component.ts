import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { catchError, tap } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  userFound = false;
  username: string;
  error = 0;
  form = this.fb.group({
    username: '',
    password: '',
  });

  submit() {
    if (this.userFound) {
      this.finish();
    } else {
      this.login();
    }
  }

  login() {
    const { username } = this.form.value;
    this.http
      .get(`/login?username=${username}`)
      .pipe(
        tap(() => {
          this.userFound = true;
          this.username = this.form.value.username;
          this.error = 0;
        }),
        catchError((error: HttpErrorResponse) => {
          this.form.reset();
          if (error.status === 0) {
            this.error = 500;
            return error.message;
          } else {
            this.error = error.status;
            return error.message;
          }
        })
      )
      .subscribe();
  }

  finish() {
    const { username, password } = this.form.value;
    this.http
      .get(`/auth?username=${username}&password=${password}`)
      .pipe(
        tap(() => {
          const url = window.location.href;
          this.error = 0;
          if (url.includes('?')) {
            const httpParams = new HttpParams({
              fromString: url.split('?')[1],
            });
            const replace = httpParams.get('url');
            if (replace) {
              window.location.replace(replace);
            }
          }
        }),
        catchError((error: HttpErrorResponse) => {
          this.userFound = false;
          this.form.reset();
          if (error.status === 0) {
            this.error = 500;
            return error.message;
          } else {
            this.error = error.status;
            return error.message;
          }
        })
      )
      .subscribe();
  }

  constructor(private fb: FormBuilder, private http: HttpClient) {}
}
