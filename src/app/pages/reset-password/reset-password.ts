import { Component, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { supabase } from '../../supabase.client'
import { Header } from '../../components/header/header'

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, Header],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss'
})
export class ResetPassword implements OnInit {
  password = ''
  confirmPassword = ''
  showPassword = false
  showConfirmPassword = false
  loading = signal(false)
  errorMsg = signal('')
  successMsg = signal(false)
  sessionReady = signal(false)

  constructor(private router: Router) {}

  async ngOnInit() {
    // Link từ email chứa token dạng recovery, Supabase-js tự parse thành session
    // khi trang load. Poll ngắn để chắc chắn session đã sẵn sàng trước khi cho đổi mk.
    const start = Date.now()
    while (Date.now() - start < 5000) {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        this.sessionReady.set(true)
        return
      }
      await new Promise(r => setTimeout(r, 300))
    }
    this.errorMsg.set('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu gửi lại.')
  }

  async onSave() {
    this.errorMsg.set('')

    if (this.password.length < 6) {
      this.errorMsg.set('Mật khẩu phải từ 6 ký tự')
      return
    }
    if (this.password !== this.confirmPassword) {
      this.errorMsg.set('Mật khẩu xác nhận không khớp')
      return
    }

    this.loading.set(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: this.password })
      if (error) throw error

      this.successMsg.set(true)
      setTimeout(() => this.router.navigate(['/login']), 3000)
    } catch (e: any) {
      this.errorMsg.set(e.message ?? 'Không thể đặt lại mật khẩu')
    } finally {
      this.loading.set(false)
    }
  }
}