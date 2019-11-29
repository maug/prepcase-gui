import { Component, isDevMode, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogTexts, HelpDialogComponent } from '../help-dialog/help-dialog.component';
import { MatDialog } from '@angular/material';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { PleaseWaitOverlayService } from '../please-wait-overlay/please-wait-overlay.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  mainForm: FormGroup;

  constructor(
    public userService: UserService,
    private pleaseWaitService: PleaseWaitOverlayService,
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
    this.pleaseWaitService.show();
    this.userService.login(
      this.mainForm.get('username').value,
      this.mainForm.get('password').value
    ).subscribe(data => {
      this.pleaseWaitService.hide();
      if (data.error_code !== '') {
        const texts: DialogTexts = [{ text: data.error, classes: 'error' }];
        if (['no_prepcase_file', 'invalid_prepcase_file'].includes(data.error_code) ) {
          texts.push({ text: '<br>', keepHtml: true });
          texts.push(`Please create .prepcase.json file in your home directory on Athena:`);
          texts.push({ text: 'echo >$HOME/.prepcase.json \'{ "password": "YOUR_PASSWORD_HERE", "cesm_path": "~/cesm" }\'', classes: 'monospace' });
          texts.push('The password will be used to login to PrepCASE.');
          texts.push('"cesm_path" should point to your CESM installation.');
          texts.push('The file should be readable and writable only by your user:');
          texts.push({ text: ' chmod 600 $HOME/.prepcase.json', classes: 'monospace' });
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
