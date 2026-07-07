import { Component, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterLink, Router } from '@angular/router'
import { AuthService } from '../../services/auth.service'
import { Header } from '../../components/header/header'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Header],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  identifier = '' // email hoặc phone
  password = ''
  showPassword = false
  rememberMe = false
  loading = signal(false)
  errorMsg = signal('')

  constructor(private auth: AuthService, private router: Router) {}

  async onSignIn() {
  this.errorMsg.set('')
  if (!this.identifier.trim() || !this.password) {
    this.errorMsg.set('Vui lòng nhập đầy đủ thông tin')
    return
  }

  this.auth.setRememberMe(this.rememberMe) // ← set cờ trước khi login
  this.loading.set(true)
  try {
    await this.auth.login(this.identifier.trim(), this.password)
    this.router.navigate(['/'])
  } catch (e: any) {
    this.errorMsg.set('Email/SĐT hoặc mật khẩu không đúng')
  } finally {
    this.loading.set(false)
  }
}

async onGoogleClick() {
  this.auth.setRememberMe(this.rememberMe) // ← áp dụng luôn cho Google
  this.loading.set(true)
  try {
    await this.auth.loginWithGoogle()
  } catch (e: any) {
    this.errorMsg.set(e.message ?? 'Đăng nhập Google thất bại')
    this.loading.set(false)
  }
}
}