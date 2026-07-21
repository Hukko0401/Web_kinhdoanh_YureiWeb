import { CommonModule } from '@angular/common'
import { Component, OnInit, signal } from '@angular/core'
import { RouterModule } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { NewsletterService } from '../../services/newsletter.service'
import { AuthService } from '../../services/auth.service'
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs'

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer implements OnInit {
  isSubscribed = signal(false)
  isEmailLocked = signal(false)
  message = signal('')
  messageType = signal<'success' | 'error' | null>(null)
  isSubmitting = signal(false)

  private emailChanged$ = new Subject<string>()
  email = ''

  supportEmail = 'hkhoasupercute@gmail.com'

  galleryLinks = [
  { label: 'All Collection', route: '/', fragment: 'collection-section' },
  { label: 'Coming Soon', route: '/', fragment: 'coming-soon-section' }
]
  informationLinks = [
    { label: 'How to Roll', route: '/how-to-roll' },
    { label: 'About Us', route: '/about' },
    { label: 'Contact Us', route: '/contact' },
    { label: 'News', route: '/news' }
  ]
  helpLinks = [
    { label: 'Terms & Conditions', route: '/terms' },
    { label: 'Online Returns', route: '/online-returns' },
    { label: 'Shipping Policy', route: '/shipping' },
    { label: 'Track Your Order', route: '/order-history' }
  ]

  constructor(
    private newsletterService: NewsletterService,
    private authService: AuthService
  ) {
    this.emailChanged$
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(async email => {
        this.message.set('')
        if (!email.trim()) {
          this.isSubscribed.set(false)
          return
        }
        const subscribed = await this.newsletterService.isSubscribed(email)
        this.isSubscribed.set(subscribed)
      })
  }

  async subscribe(): Promise<void> {
    if (this.isSubscribed()) return

    this.message.set('')
    this.messageType.set(null)
    this.isSubmitting.set(true)

    try {
      const result = await this.newsletterService.subscribe(this.email)
      this.message.set(result.message)
      this.messageType.set(result.success ? 'success' : 'error')
      if (result.success) {
        this.isSubscribed.set(true)
      }
    } catch (e: any) {
      console.error('Subscribe error:', e)
      this.message.set('Something went wrong. Please try again.')
      this.messageType.set('error')
    } finally {
      this.isSubmitting.set(false)
    }
  }

  onEmailChange(): void {
    this.emailChanged$.next(this.email)
  }

  async ngOnInit(): Promise<void> {
    const user = this.authService.getCurrentUser()
    if (user?.email) {
      this.email = user.email
      this.isEmailLocked.set(true)
      const subscribed = await this.newsletterService.isSubscribed(user.email)
      this.isSubscribed.set(subscribed)
    }
  }
}