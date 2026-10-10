import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignupComponent } from './signup.component';
import { TranslateModule } from '@ngx-translate/core';
import { AccountService } from '../../services/account.service';
import { AlertService, MessageSeverity } from '../../services/alert.service';
import { AccountEndpoint } from '../../services/account-endpoint.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let mockAccountService: jasmine.SpyObj<AccountService>;
  let mockAlertService: jasmine.SpyObj<AlertService>;
  let mockAccountEndpoint: jasmine.SpyObj<AccountEndpoint>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockAccountService = jasmine.createSpyObj('AccountService', [], { isLoggedIn: false });
    mockAlertService = jasmine.createSpyObj('AlertService', ['showMessage', 'startLoadingMessage', 'stopLoadingMessage', 'showStickyMessage']);
    mockAccountEndpoint = jasmine.createSpyObj('AccountEndpoint', ['getSignUpEndpoint']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [SignupComponent, TranslateModule.forRoot()],
      providers: [
        { provide: AccountService, useValue: mockAccountService },
        { provide: AlertService, useValue: mockAlertService },
        { provide: AccountEndpoint, useValue: mockAccountEndpoint },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to home if already logged in', () => {
    (mockAccountService as any).isLoggedIn = true;
    component.ngOnInit();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should show error if passwords do not match', () => {
    component.userSignUp.password = 'password123';
    component.userSignUp.confirmPassword = 'password456';
    component.signup();
    expect(mockAlertService.showMessage).toHaveBeenCalledWith('Password Mismatch', jasmine.any(String), MessageSeverity.error);
  });

  it('should show error for invalid email', () => {
    component.userSignUp.userName = 'testuser';
    component.userSignUp.email = 'invalid-email';
    component.userSignUp.password = 'password123';
    component.userSignUp.confirmPassword = 'password123';
    component.signup();
    expect(mockAlertService.showMessage).toHaveBeenCalledWith('Invalid Email', jasmine.any(String), MessageSeverity.error);
  });

  it('should call signup endpoint with correct data', () => {
    mockAccountEndpoint.getSignUpEndpoint.and.returnValue(of({ success: true }));
    component.userSignUp.userName = 'testuser';
    component.userSignUp.email = 'test@example.com';
    component.userSignUp.password = 'password123';
    component.userSignUp.confirmPassword = 'password123';
    component.userSignUp.fullName = 'Test User';

    component.signup();

    expect(mockAccountEndpoint.getSignUpEndpoint).toHaveBeenCalled();
    expect(mockAlertService.startLoadingMessage).toHaveBeenCalled();
  });

  it('should handle signup success', (done) => {
    jasmine.clock().install();
    mockAccountEndpoint.getSignUpEndpoint.and.returnValue(of({ success: true }));
    component.userSignUp.userName = 'testuser';
    component.userSignUp.email = 'test@example.com';
    component.userSignUp.password = 'password123';
    component.userSignUp.confirmPassword = 'password123';

    component.signup();

    expect(mockAlertService.startLoadingMessage).toHaveBeenCalled();

    jasmine.clock().tick(1000);
    expect(mockAlertService.stopLoadingMessage).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);

    jasmine.clock().uninstall();
    done();
  });

  it('should handle signup error', (done) => {
    jasmine.clock().install();
    const error = { error: { message: 'Username already exists' } };
    mockAccountEndpoint.getSignUpEndpoint.and.returnValue(throwError(() => error));
    component.userSignUp.userName = 'existinguser';
    component.userSignUp.email = 'test@example.com';
    component.userSignUp.password = 'password123';
    component.userSignUp.confirmPassword = 'password123';

    component.signup();

    jasmine.clock().tick(1000);
    expect(mockAlertService.showMessage).toHaveBeenCalled();

    jasmine.clock().uninstall();
    done();
  });
});
