// ---------------------------------------
// Email: quickapp@ebenmonney.com
// Templates: www.nikutv.com/templates
// (c) 2024 www.nikutv.com/mit-license
// ---------------------------------------

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';

import { fadeInOut } from '../../services/animations';
import { AlertService, MessageSeverity } from '../../services/alert.service';

export interface TeleprompterSession {
  id: string;
  title: string;
  content: string;
  createdDate: Date;
  updatedDate: Date;
  duration?: number;
}

@Component({
  selector: 'app-teleprompter-dashboard',
  templateUrl: './teleprompter-dashboard.component.html',
  styleUrl: './teleprompter-dashboard.component.scss',
  animations: [fadeInOut],
  imports: [CommonModule, FormsModule, TranslateModule],
  standalone: true
})
export class TeleprompterDashboardComponent {
  private alertService = inject(AlertService);
  private router = inject(Router);

  sessions = signal<TeleprompterSession[]>([
    {
      id: '1',
      title: 'Sample Script 1',
      content: 'This is a sample teleprompter script...',
      createdDate: new Date('2024-01-10'),
      updatedDate: new Date('2024-01-15'),
      duration: 300
    },
    {
      id: '2',
      title: 'Sample Script 2',
      content: 'Another teleprompter script example...',
      createdDate: new Date('2024-01-12'),
      updatedDate: new Date('2024-01-18'),
      duration: 420
    }
  ]);

  showCreateDialog = signal<boolean>(false);
  editingSession = signal<TeleprompterSession | null>(null);
  newSessionTitle = signal<string>('');
  newSessionContent = signal<string>('');
  searchTerm = signal<string>('');
  sortBy = signal<'name' | 'created' | 'updated'>('updated');

  get filteredSessions(): TeleprompterSession[] {
    let filtered = this.sessions();

    // Apply search filter
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(term) ||
        s.content.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (this.sortBy()) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'created':
          return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
        case 'updated':
        default:
          return new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime();
      }
    });

    return filtered;
  }

  createNewSession(): void {
    this.editingSession.set(null);
    this.newSessionTitle.set('');
    this.newSessionContent.set('');
    this.showCreateDialog.set(true);
  }

  editSession(session: TeleprompterSession): void {
    this.editingSession.set(session);
    this.newSessionTitle.set(session.title);
    this.newSessionContent.set(session.content);
    this.showCreateDialog.set(true);
  }

  saveSession(): void {
    if (!this.newSessionTitle().trim()) {
      this.alertService.showMessage('Please enter a title', null, MessageSeverity.error);
      return;
    }

    if (!this.newSessionContent().trim()) {
      this.alertService.showMessage('Please enter script content', null, MessageSeverity.error);
      return;
    }

    const current = this.editingSession();

    if (current) {
      // Update existing session
      current.title = this.newSessionTitle();
      current.content = this.newSessionContent();
      current.updatedDate = new Date();
      this.alertService.showMessage('Session updated successfully', null, MessageSeverity.success);
    } else {
      // Create new session
      const newSession: TeleprompterSession = {
        id: Date.now().toString(),
        title: this.newSessionTitle(),
        content: this.newSessionContent(),
        createdDate: new Date(),
        updatedDate: new Date()
      };
      this.sessions.update(s => [...s, newSession]);
      this.alertService.showMessage('Session created successfully', null, MessageSeverity.success);
    }

    this.cancelDialog();
  }

  deleteSession(id: string): void {
    if (confirm('Are you sure you want to delete this session?')) {
      this.sessions.update(s => s.filter(session => session.id !== id));
      this.alertService.showMessage('Session deleted successfully', null, MessageSeverity.success);
    }
  }

  openSession(session: TeleprompterSession): void {
    // Navigate to teleprompter component with session data
    this.router.navigate(['/teleprompter'], { state: { session } });
  }

  duplicateSession(session: TeleprompterSession): void {
    const duplicated: TeleprompterSession = {
      id: Date.now().toString(),
      title: `${session.title} (Copy)`,
      content: session.content,
      createdDate: new Date(),
      updatedDate: new Date()
    };
    this.sessions.update(s => [...s, duplicated]);
    this.alertService.showMessage('Session duplicated successfully', null, MessageSeverity.success);
  }

  exportSession(session: TeleprompterSession): void {
    const element = document.createElement('a');
    const file = new Blob([session.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${session.title}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    this.alertService.showMessage('Session exported successfully', null, MessageSeverity.success);
  }

  cancelDialog(): void {
    this.showCreateDialog.set(false);
    this.editingSession.set(null);
    this.newSessionTitle.set('');
    this.newSessionContent.set('');
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  getSessionDuration(content: string): number {
    // Rough estimate: assume average reading speed of 150 words per minute
    const wordCount = content.split(/\s+/).length;
    return Math.round((wordCount / 150) * 60);
  }
}
