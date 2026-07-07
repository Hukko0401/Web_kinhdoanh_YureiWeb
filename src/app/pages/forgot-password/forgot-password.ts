import { Component, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterLink, Router } from '@angular/router'
import { AuthService } from '../../services/auth.service'
import { Header } from '../../components/header/header'

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Header],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPassword {
  identifier = ''
  loading = signal(false)
  errorMsg = signal('')
  sentMsg = signal('')

  constructor(private auth: AuthService, private router: Router) {}

  async onSend() {
    this.errorMsg.set('')
    this.sentMsg.set('')

    if (!this.identifier.trim()) {
      this.errorMsg.set('Vui lòng nhập email hoặc số điện thoại')
      return
    }

    this.loading.set(true)
    try {
      const isPhone = !this.identifier.includes('@')
      await this.auth.sendPasswordReset(this.identifier.trim())

      this.sentMsg.set(
        isPhone
          ? 'Link đặt lại mật khẩu đã được gửi (lưu ý: vì đây là số điện thoại giả lập, email thật sẽ không nhận được link — tính năng demo cho kiến trúc, liên hệ admin để reset thủ công).'
          : 'Đã gửi link đặt lại mật khẩu, vui lòng kiểm tra email.'
      )
    } catch (e: any) {
      this.errorMsg.set('Không tìm thấy tài khoản với thông tin này')
    } finally {
      this.loading.set(false)
    }
  }

  goBack() {
    this.router.navigate(['/login'])
  }
}