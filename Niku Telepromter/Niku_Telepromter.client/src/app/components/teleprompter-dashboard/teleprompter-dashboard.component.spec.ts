import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeleprompterDashboardComponent } from './teleprompter-dashboard.component';
import { TranslateModule } from '@ngx-translate/core';
import { AlertService } from '../../services/alert.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

describe('TeleprompterDashboardComponent', () => {
  let component: TeleprompterDashboardComponent;
  let fixture: ComponentFixture<TeleprompterDashboardComponent>;
  let mockAlertService: jasmine.SpyObj<AlertService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockAlertService = jasmine.createSpyObj('AlertService', ['showMessage']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [TeleprompterDashboardComponent, TranslateModule.forRoot(), FormsModule],
      providers: [
        { provide: AlertService, useValue: mockAlertService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TeleprompterDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with sample sessions', () => {
    expect(component.sessions().length).toBeGreaterThan(0);
  });

  it('should create new session dialog', () => {
    component.createNewSession();
    expect(component.showCreateDialog()).toBeTrue();
    expect(component.editingSession()).toBeNull();
  });

  it('should open edit dialog with session data', () => {
    const session = component.sessions()[0];
    component.editSession(session);
    expect(component.showCreateDialog()).toBeTrue();
    expect(component.editingSession()).toBe(session);
    expect(component.newSessionTitle()).toBe(session.title);
    expect(component.newSessionContent()).toBe(session.content);
  });

  it('should save new session', () => {
    component.newSessionTitle.set('New Script');
    component.newSessionContent.set('Script content here');
    const initialCount = component.sessions().length;

    component.saveSession();

    expect(component.sessions().length).toBe(initialCount + 1);
    expect(mockAlertService.showMessage).toHaveBeenCalled();
    expect(component.showCreateDialog()).toBeFalse();
  });

  it('should update existing session', () => {
    const session = component.sessions()[0];
    component.editingSession.set(session);
    component.newSessionTitle.set('Updated Title');
    component.newSessionContent.set('Updated content');

    component.saveSession();

    expect(session.title).toBe('Updated Title');
    expect(session.content).toBe('Updated content');
    expect(mockAlertService.showMessage).toHaveBeenCalled();
  });

  it('should show error when saving with empty title', () => {
    component.newSessionTitle.set('');
    component.newSessionContent.set('Some content');

    component.saveSession();

    expect(mockAlertService.showMessage).toHaveBeenCalled();
  });

  it('should show error when saving with empty content', () => {
    component.newSessionTitle.set('Title');
    component.newSessionContent.set('');

    component.saveSession();

    expect(mockAlertService.showMessage).toHaveBeenCalled();
  });

  it('should delete session', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const sessionId = component.sessions()[0].id;
    const initialCount = component.sessions().length;

    component.deleteSession(sessionId);

    expect(component.sessions().length).toBe(initialCount - 1);
    expect(mockAlertService.showMessage).toHaveBeenCalled();
  });

  it('should not delete session when not confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    const initialCount = component.sessions().length;

    component.deleteSession(component.sessions()[0].id);

    expect(component.sessions().length).toBe(initialCount);
  });

  it('should open session in teleprompter', () => {
    const session = component.sessions()[0];
    component.openSession(session);

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/teleprompter'], { state: { session } });
  });

  it('should duplicate session', () => {
    const session = component.sessions()[0];
    const initialCount = component.sessions().length;

    component.duplicateSession(session);

    expect(component.sessions().length).toBe(initialCount + 1);
    const duplicated = component.sessions()[initialCount];
    expect(duplicated.title).toContain(session.title);
    expect(duplicated.content).toBe(session.content);
    expect(mockAlertService.showMessage).toHaveBeenCalled();
  });

  it('should export session', () => {
    spyOn(URL, 'createObjectURL').and.returnValue('blob:mock-url');
    const session = component.sessions()[0];

    component.exportSession(session);

    expect(mockAlertService.showMessage).toHaveBeenCalled();
  });

  it('should cancel dialog', () => {
    component.showCreateDialog.set(true);
    component.newSessionTitle.set('Some title');
    component.newSessionContent.set('Some content');

    component.cancelDialog();

    expect(component.showCreateDialog()).toBeFalse();
    expect(component.newSessionTitle()).toBe('');
    expect(component.newSessionContent()).toBe('');
  });

  it('should filter sessions by search term', () => {
    component.searchTerm.set('Sample Script 1');
    const filtered = component.filteredSessions;

    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.some(s => s.title.includes('Sample Script 1'))).toBeTrue();
  });

  it('should sort sessions by name', () => {
    component.sortBy.set('name');
    const filtered = component.filteredSessions;

    for (let i = 1; i < filtered.length; i++) {
      expect(filtered[i].title.localeCompare(filtered[i - 1].title)).toBeGreaterThanOrEqual(0);
    }
  });

  it('should sort sessions by last updated', () => {
    component.sortBy.set('updated');
    const filtered = component.filteredSessions;

    for (let i = 1; i < filtered.length; i++) {
      const current = new Date(filtered[i].updatedDate).getTime();
      const previous = new Date(filtered[i - 1].updatedDate).getTime();
      expect(current).toBeLessThanOrEqual(previous);
    }
  });

  it('should calculate session duration', () => {
    const content = 'word '.repeat(150); // 150 words = roughly 60 seconds at 150 WPM
    const duration = component.getSessionDuration(content);

    expect(duration).toBeCloseTo(60, -1);
  });

  it('should format date correctly', () => {
    const date = new Date('2024-01-15');
    const formatted = component.formatDate(date);

    expect(formatted).toBeTruthy();
    expect(typeof formatted).toBe('string');
  });
});
