import { Component } from '@angular/core'
import { UserService } from './user.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(public userService: UserService) {}

  title = 'prepcase-gui'
}
