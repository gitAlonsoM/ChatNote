import { TestBed } from '@angular/core/testing';
import { AuthService } from '../services/auth.service';
import { AuthGuard } from './auth.guard';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { User } from 'firebase/auth';

describe('AuthGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let authGuard: AuthGuard;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['getUser']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    });

    authGuard = TestBed.inject(AuthGuard);
  });

  it('debería denegar el acceso si el usuario no está autenticado', (done: DoneFn) => {
    authService.getUser.and.returnValue(of(null)); // Simula que no hay usuario autenticado

    const result = authGuard.canActivate();
    result.subscribe(isAllowed => {
      expect(isAllowed).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
      done();
    });
  });
});