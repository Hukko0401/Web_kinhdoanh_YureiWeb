import { Component, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterLink, Router } from '@angular/router'
import { AuthService } from '../../services/auth.service'
import { Header } from '../../components/header/header'
import { PhoneInput } from '../../components/phone-input/phone-input'

type LoginMode = 'email' | 'phone'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Header, PhoneInput],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  mode = signal<LoginMode>('phone')

  email = ''
  phone = '' // giá trị full E.164 do PhoneInput trả ra, vd "+84933498894"
  password = ''
  showPassword = false
  rememberMe = false
  loading = signal(false)
  errorMsg = signal('')

  constructor(private auth: AuthService, private router: Router) {}

  setMode(mode: LoginMode) {
    this.mode.set(mode)
    this.errorMsg.set('')
  }

  async onSignIn() {
    this.errorMsg.set('')

    const identifier = this.mode() === 'email' ? this.email.trim() : this.phone.trim()

    if (!identifier || !this.password) {
      this.errorMsg.set('Vui lòng nhập đầy đủ thông tin')
      return
    }

    if (this.mode() === 'phone' && !identifier.startsWith('+')) {
      this.errorMsg.set('Vui lòng nhập số điện thoại hợp lệ')
      return
    }

    this.auth.setRememberMe(this.rememberMe)
    this.loading.set(true)
    try {
      await this.auth.login(identifier, this.password)
      this.router.navigate(['/'])
    } catch (e: any) {
      this.errorMsg.set('Email/SĐT hoặc mật khẩu không đúng')
    } finally {
      this.loading.set(false)
    }
  }

  async onGoogleClick() {
    this.auth.setRememberMe(this.rememberMe)
    this.loading.set(true)
    try {
      await this.auth.loginWithGoogle()
    } catch (e: any) {
      this.errorMsg.set(e.message ?? 'Đăng nhập Google thất bại')
      this.loading.set(false)
    }
  }
}