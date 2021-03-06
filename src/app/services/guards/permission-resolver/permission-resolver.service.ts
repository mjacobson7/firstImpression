import { Injectable } from '@angular/core';
import { Resolve, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class PermissionResolverService implements Resolve<any> {

  constructor(private router: Router, private authService: AuthService, private httpClient: HttpClient) { }

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    if (this.authService.permissionsMap) {
      return of(this.authService.permissionsMap);
    } else {
      return this.httpClient.get<any>('/userPermissions').pipe(map(permissions => {
        this.authService.permissionsMap = permissions;
        return permissions;
      }));
    }
  }

}
