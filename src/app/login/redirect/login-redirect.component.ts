import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Profile } from '../../models/core/profile';
import { Login } from '../../models/core/login';
import { LoginService } from '../login.service';

@Component({
  selector: 'spotify-login-redirect',
  templateUrl: './login-redirect.component.html',
  styleUrls: ['./login-redirect.component.scss'],
})
export class LoginRedirectComponent implements OnInit {
  private _code!: string;
  constructor(
    private activatedRoute: ActivatedRoute,
    private loginService: LoginService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.code = this.activatedRoute.snapshot.queryParamMap.get(
      'code'
    ) as string;
    this.loginService.login(this.code).subscribe((data: Login) => {
      if (data) {
        this.loginService.getMyProfile().subscribe(async (profile: Profile) => {
          await this.loginService.updateProfile(profile);
          this.router.navigate(['/dashboard']);
        });
      }
    });
  }

  set code(value: string) {
    this._code = value;
  }
  get code(): string {
    return this._code;
  }
}
