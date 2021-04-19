import { Component, isDevMode, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogTexts, HelpDialogComponent } from '../help-dialog/help-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { PleaseWaitOverlayService } from '../please-wait-overlay/please-wait-overlay.service';
import { ServerConfigService } from '../server-config.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  isLoaded = false;
  mainForm: FormGroup;
  hosts: string[];

  constructor(
    public userService: UserService,
    public serverConfigService: ServerConfigService,
    private pleaseWaitService: PleaseWaitOverlayService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
  ) { }

  async ngOnInit() {
    try {
      const config = await this.serverConfigService.getConfig();
      this.hosts = config.map(entry => entry.host);
      console.log('CONFIG', config, typeof config);
    } catch (error) {
      this.dialog.open(HelpDialogComponent, {
        disableClose: true,
        data: {
          header: 'LOADING DATA ERROR',
          texts: [error],
        }
      });
      return; // fatal crash, stop app
    }

    this.mainForm = this.formBuilder.group({
      'host': [this.hosts[0], [Validators.required]],
      'username': ['', [Validators.required]],
      'password': ['', [Validators.required]],
    });

    if (isDevMode()) {
      this.mainForm.get('username').setValue('vagrant');
      this.mainForm.get('password').setValue('test');
    }

    this.isLoaded = true;
  }

  onSubmit() {
    this.pleaseWaitService.show();
    this.userService.login(
      this.mainForm.get('host').value,
      this.mainForm.get('username').value,
      this.mainForm.get('password').value
    ).subscribe(data => {
      this.pleaseWaitService.hide();
      if (data.error_code !== '') {
        let texts: DialogTexts = [{ text: data.error, classes: 'error' }];
        if (['no_prepcase_file', 'invalid_prepcase_file'].includes(data.error_code) ) {
          texts.push({ text: '<br>', keepHtml: true });
          texts = texts.concat(this.getConfigFileHelp(this.mainForm.get('host').value));
        }
        this.displayHelp(texts);
      } else {
        this.router.navigate(['/case-list']);
      }
    });
  }

  logout() {
    this.userService.logout();
  }

  displayHelp(texts?: DialogTexts): void {
    if (!texts) {
      texts = [];
      texts.push(`You should use your Athena username and PrepCASE password (details below).`);
      texts.push({ text: '<br>', keepHtml: true });
      texts = texts.concat(this.getConfigFileHelp(this.mainForm.get('host').value));
    }
    this.dialog.open(HelpDialogComponent, {
      data: {
        texts
      }
    });
  }

  private getConfigFileHelp(hostname: string): DialogTexts {
    const texts: DialogTexts = [];
    texts.push(`To log in you have to create .prepcase.json file in your home directory on "${hostname}":`);
    texts.push({ text: 'echo >$HOME/.prepcase.json \'{ "password": "YOUR_PASSWORD_HERE", "cesm_path": "PATH_TO_CESM", "cesm_env_script": "PATH_TO_ENV_SCRIPT", "user_scripts_dir": "SCRIPTS_DIR" }\'', classes: 'monospace' });
    texts.push(`"password" will be used to login to PrepCASE. It should be different than your password on "${hostname}".`);
    texts.push('"cesm_path" should point to your CESM installation, for example "~/CESM".');
    texts.push('"cesm_env_script" (optional) is path to bash script used to set up environment before executing CESM script. Leave empty if not needed.');
    texts.push('"user_scripts_dir" (optional) is directory of your custom scripts. Scripts should be executable. Leave empty if not needed.');
    texts.push('The file should be readable and writable only by your user:');
    texts.push({ text: ' chmod 600 $HOME/.prepcase.json', classes: 'monospace' });
    return texts;
  }
}
