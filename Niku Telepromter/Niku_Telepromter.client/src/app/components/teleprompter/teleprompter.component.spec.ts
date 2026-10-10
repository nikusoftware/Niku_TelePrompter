import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeleprompterComponent } from './teleprompter.component';
import { TranslateModule } from '@ngx-translate/core';
import { ConfigurationService } from '../../services/configuration.service';
import { AlertService } from '../../services/alert.service';
import { Router } from '@angular/router';

describe('TeleprompterComponent', () => {
  let component: TeleprompterComponent;
  let fixture: ComponentFixture<TeleprompterComponent>;
  let mockConfigService: jasmine.SpyObj<ConfigurationService>;
  let mockAlertService: jasmine.SpyObj<AlertService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockConfigService = jasmine.createSpyObj('ConfigurationService', ['getSomething']);
    mockAlertService = jasmine.createSpyObj('AlertService', ['showMessage']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [TeleprompterComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ConfigurationService, useValue: mockConfigService },
        { provide: AlertService, useValue: mockAlertService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TeleprompterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default script text', () => {
    expect(component.scriptText()).toBe('Enter your script here...');
  });

  it('should initialize with isPlaying as false', () => {
    expect(component.isPlaying()).toBeFalse();
  });

  it('should initialize with playback speed of 1', () => {
    expect(component.playbackSpeed()).toBe(1);
  });

  it('should initialize with font size of 24', () => {
    expect(component.fontSize()).toBe(24);
  });

  it('should toggle playback state', () => {
    const initialState = component.isPlaying();
    component.togglePlayback();
    expect(component.isPlaying()).toBe(!initialState);
  });

  it('should start playback', () => {
    component.startPlayback();
    expect(component.isPlaying()).toBeTrue();
  });

  it('should stop playback', () => {
    component.startPlayback();
    component.stopPlayback();
    expect(component.isPlaying()).toBeFalse();
  });

  it('should pause playback', () => {
    component.startPlayback();
    component.pausePlayback();
    expect(component.isPlaying()).toBeFalse();
  });

  it('should reset scroll and stop playback', () => {
    component.startPlayback();
    component.resetScroll();
    expect(component.isPlaying()).toBeFalse();
  });

  it('should increase font size', () => {
    const initialSize = component.fontSize();
    component.increaseFontSize();
    expect(component.fontSize()).toBe(initialSize + 2);
  });

  it('should not increase font size beyond maximum', () => {
    component.fontSize.set(48);
    component.increaseFontSize();
    expect(component.fontSize()).toBe(48);
  });

  it('should decrease font size', () => {
    component.fontSize.set(26);
    component.decreaseFontSize();
    expect(component.fontSize()).toBe(24);
  });

  it('should not decrease font size below minimum', () => {
    component.fontSize.set(12);
    component.decreaseFontSize();
    expect(component.fontSize()).toBe(12);
  });

  it('should increase playback speed', () => {
    const initialSpeed = component.playbackSpeed();
    component.increaseSpeed();
    expect(component.playbackSpeed()).toBe(initialSpeed + 0.25);
  });

  it('should not increase speed beyond maximum', () => {
    component.playbackSpeed.set(2);
    component.increaseSpeed();
    expect(component.playbackSpeed()).toBe(2);
  });

  it('should decrease playback speed', () => {
    component.playbackSpeed.set(1.5);
    component.decreaseSpeed();
    expect(component.playbackSpeed()).toBe(1.25);
  });

  it('should not decrease speed below minimum', () => {
    component.playbackSpeed.set(0.5);
    component.decreaseSpeed();
    expect(component.playbackSpeed()).toBe(0.5);
  });

  it('should clear script text', () => {
    component.scriptText.set('Some script text');
    component.clearScript();
    expect(component.scriptText()).toBe('');
    expect(component.isPlaying()).toBeFalse();
  });
});
