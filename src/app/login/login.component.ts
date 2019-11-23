import { Component, isDevMode, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HelpDialogComponent } from '../help-dialog/help-dialog.component';
import { MatDialog } from '@angular/material';
import { UserService } from '../user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  mainForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private userService: UserService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.mainForm = this.formBuilder.group({
      'username': ['', [Validators.required]],
      'password': ['', [Validators.required]],
    });

    if (isDevMode()) {
      this.mainForm.get('username').setValue('vagrant');
      this.mainForm.get('password').setValue('test');
    }
  }

  onSubmit() {
    this.dialog.open(HelpDialogComponent, {
      disableClose: true,
      data: {
        texts: 'Please wait...',
      }
    });
    this.userService.login(
      this.mainForm.get('username').value,
      this.mainForm.get('password').value
    ).subscribe(data => {
      this.dialog.closeAll();
      if (data.error_code !== '') {
        this.dialog.open(HelpDialogComponent, {
          data: {
            texts: [{ text: data.error, classes: 'error' }],
          }
        });
      } else {
        this.router.navigate(['/case-list']);
      }
    });
  }

  logout() {
    this.userService.logout();
  }
}
