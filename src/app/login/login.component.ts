import { Component, isDevMode, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogTexts, HelpDialogComponent } from '../help-dialog/help-dialog.component';
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
    public userService: UserService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
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
        const texts: DialogTexts = [{ text: data.error, classes: 'error' }];
        if (['no_prepcase_file', 'invalid_prepcase_file'].includes(data.error_code) ) {
          texts.push({ text: '<br>', keepHtml: true });
          texts.push('Please create .prepcase.json file in your home directory with contents:');
          texts.push({ text: '{ "password": "YOUR_PASSWORD_HERE" }', classes: 'monospace' });
          texts.push('The password will be used to login to PrepCASE.');
          texts.push('The file should be readable and writable only by your user:');
          texts.push({ text: 'chmod 600 .prepcase.json', classes: 'monospace' });
        }
        this.dialog.open(HelpDialogComponent, {
          data: {
            texts
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
