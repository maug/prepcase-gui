import { Injectable } from '@angular/core'
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router'
import { from, Observable } from 'rxjs'
import { UserService } from '../user.service'
import { map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private userService: UserService) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    console.log('AuthGuard#canActivate called')
    return from(this.userService.isLogged()).pipe(
      map((data) => {
        if (data) {
          return true
        }
        this.router.navigate(['/login'])
        return false
      })
    )
  }
}
