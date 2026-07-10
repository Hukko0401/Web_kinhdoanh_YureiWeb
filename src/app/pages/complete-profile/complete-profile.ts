import { Component, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { AuthService } from '../../services/auth.service'
import { Header } from '../../components/header/header'

@Component({
  selector: 'app-complete-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, Header],
  templateUrl: './complete-profile.html',
  styleUrl: './complete-profile.scss'
})
export class CompleteProfile {
  username = ''
  loading = signal(false)
  errorMsg = signal('')
  usernameStatus = signal<'idle' | 'checking' | 'available' | 'taken'>('idle')

  constructor(private auth: AuthService, private router: Router) {}

  async onUsernameBlur() {
    const value = this.username.trim()
    if (!value) {
      this.usernameStatus.set('idle')
      return
    }
    this.usernameStatus.set('checking')
    const exists = await this.auth.checkUsernameExists(value)
    this.usernameStatus.set(exists ? 'taken' : 'available')
  }

  async onSubmit() {
    this.errorMsg.set('')
    const value = this.username.trim()
    if (!value) {
      this.errorMsg.set('Please enter a username')
      return
    }
    if (this.usernameStatus() === 'taken') {
      this.errorMsg.set('This username is already taken')
      return
    }

    this.loading.set(true)
    try {
      await this.auth.completeGoogleProfile(value)
      this.router.navigate(['/'])
    } catch (e: any) {
      this.errorMsg.set(e.message ?? 'Failed to save username')
    } finally {
      this.loading.set(false)
    }
  }
}