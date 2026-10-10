// ---------------------------------------
// Email: quickapp@ebenmonney.com
// Templates: www.nikutv.com/templates
// (c) 2024 www.nikutv.com/mit-license
// ---------------------------------------

import { Component, inject, signal, viewChild, ElementRef, AfterViewInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';

import { fadeInOut } from '../../services/animations';
import { ConfigurationService } from '../../services/configuration.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-teleprompter',
  templateUrl: './teleprompter.component.html',
  styleUrl: './teleprompter.component.scss',
  animations: [fadeInOut],
  imports: [CommonModule, FormsModule, TranslateModule],
  standalone: true
})
export class TeleprompterComponent implements AfterViewInit {
  private configurations = inject(ConfigurationService);
  private alertService = inject(AlertService);
  private router = inject(Router);

  // Template reference
  readonly scriptDisplay = viewChild.required<ElementRef<HTMLDivElement>>('scriptDisplay');

  // State signals
  scriptText = signal<string>('Enter your script here...');
  isPlaying = signal<boolean>(false);
  playbackSpeed = signal<number>(1);
  fontSize = signal<number>(24);
  scrollPosition = signal<number>(0);

  // Playback control
  private playbackInterval: NodeJS.Timeout | null = null;
  private readonly scrollSpeed = 5; // pixels per interval

  constructor() {
    // Effect to handle playback
    effect(() => {
      if (this.isPlaying()) {
        this.startPlaybackInterval();
      } else {
        this.stopPlaybackInterval();
      }
    });
  }

  ngAfterViewInit(): void {
    // Initialize script display
    this.resetScroll();
  }

  private startPlaybackInterval(): void {
    const speed = this.playbackSpeed();
    const interval = 100 / speed; // Adjust interval based on speed

    this.playbackInterval = setInterval(() => {
      const display = this.scriptDisplay().nativeElement;
      const maxScroll = display.scrollHeight - display.clientHeight;

      if (display.scrollTop >= maxScroll) {
        this.stopPlaybackInterval();
        this.isPlaying.set(false);
      } else {
        display.scrollTop += this.scrollSpeed * speed;
      }
    }, interval);
  }

  private stopPlaybackInterval(): void {
    if (this.playbackInterval) {
      clearInterval(this.playbackInterval);
      this.playbackInterval = null;
    }
  }

  togglePlayback(): void {
    this.isPlaying.update(value => !value);
  }

  startPlayback(): void {
    this.isPlaying.set(true);
  }

  stopPlayback(): void {
    this.isPlaying.set(false);
  }

  pausePlayback(): void {
    this.isPlaying.set(false);
  }

  resetScroll(): void {
    if (this.scriptDisplay()) {
      this.scriptDisplay().nativeElement.scrollTop = 0;
    }
    this.isPlaying.set(false);
  }

  increaseFontSize(): void {
    this.fontSize.update(size => Math.min(size + 2, 48));
  }

  decreaseFontSize(): void {
    this.fontSize.update(size => Math.max(size - 2, 12));
  }

  increaseSpeed(): void {
    this.playbackSpeed.update(speed => Math.min(speed + 0.25, 2));
  }

  decreaseSpeed(): void {
    this.playbackSpeed.update(speed => Math.max(speed - 0.25, 0.5));
  }

  loadScript(): void {
    // This would typically load from a file or service
    // For now, it's a placeholder for future implementation
  }

  saveScript(): void {
    // This would typically save to a service
    // For now, it's a placeholder for future implementation
  }

  clearScript(): void {
    this.scriptText.set('');
    this.resetScroll();
  }
}
