import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NewsletterService } from '../../../services/newsletter.service';

@Component({
  selector: 'app-cta-section',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './cta-section.html',
  styleUrl: './cta-section.scss'
})
export class CtaSection {
  email = '';
  loading = signal(false);
  message = signal('');
  messageType = signal<'success' | 'error' | null>(null);

  constructor(private newsletterService: NewsletterService) {}

  async onSubscribe(): Promise<void> {
    this.message.set('');
    this.loading.set(true);

    const result = await this.newsletterService.subscribe(this.email);

    this.message.set(result.message);
    this.messageType.set(result.success ? 'success' : 'error');
    this.loading.set(false);

    if (result.success) {
      this.email = '';
    }
  }
}