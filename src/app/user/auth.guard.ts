import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from "@angular/router";
import { AngularFireAuth } from "@angular/fire/auth";
import { SnackService } from "../services/snack.service";

@Injectable({
  providedIn: "root"
})
export class AuthGuard implements CanActivate {
  constructor(private afAuth: AngularFireAuth, private snack: SnackService) {}
  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    var promise = new Promise((resolve, reject) => {
      this.afAuth.authState.subscribe(res => {
        if (res && res.uid) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
    return !!promise;
  }
}
