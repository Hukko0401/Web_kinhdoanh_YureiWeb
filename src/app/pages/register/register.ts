import { Component, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { AuthService } from '../../services/auth.service'
import { Header } from '../../components/header/header' 
import { PhoneInput } from '../../components/phone-input/phone-input'//
type Step = 'form' | 'phone' | 'otp' | 'success'

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule,Header,PhoneInput],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  step = signal<Step>('form')
  loading = signal(false)
  errorMsg = signal('')

  // step form
  username = ''
  password = ''
  confirmPassword = ''
  showPassword = false
  showConfirmPassword = false

  // step phone
  phone = ''

  // step otp
  otpDigits = ['', '', '', '']
  devOtpHint = '' // chỉ hiện trong demo, xóa khi nộp bài thật

  constructor(private auth: AuthService, private router: Router) {}

  private validateFormStep(): boolean {
    this.errorMsg.set('')
    if (!this.username.trim()) {
      this.errorMsg.set('Vui lòng nhập Username')
      return false
    }
    if (this.password.length < 6) {
      this.errorMsg.set('Password phải từ 6 ký tự')
      return false
    }
    if (this.password !== this.confirmPassword) {
      this.errorMsg.set('Password xác nhận không khớp')
      return false
    }
    return true
  }

  async onGoogleClick() {
    if (!this.validateFormStep()) return
    this.loading.set(true)
    try {
      await this.auth.loginWithGoogle(this.username.trim())
      // trình duyệt sẽ redirect đi, không cần set loading lại
    } catch (e: any) {
      this.errorMsg.set(e.message ?? 'Đăng ký Google thất bại')
      this.loading.set(false)
    }
  }

  onPhoneOptionClick() {
    if (!this.validateFormStep()) return
    this.step.set('phone')
  }

  onSendOtp() {
    this.errorMsg.set('')
    if (!this.phone || !this.phone.startsWith('+')) {
      this.errorMsg.set('Vui lòng nhập số điện thoại hợp lệ')
      return
    }
    const code = this.auth.sendFakeOtp(this.phone)
    this.devOtpHint = code
    this.otpDigits = ['', '', '', '']
    this.step.set('otp')
  }

  onResendOtp() {
    const code = this.auth.sendFakeOtp(this.phone.trim())
    this.devOtpHint = code
  }

  async onVerifyOtp() {
    this.errorMsg.set('')
    const code = this.otpDigits.join('')
    if (code.length < 4) {
      this.errorMsg.set('Vui lòng nhập đủ 4 số')
      return
    }
    if (!this.auth.verifyFakeOtp(this.phone.trim(), code)) {
      this.errorMsg.set('Mã OTP không đúng')
      return
    }

    this.loading.set(true)
    try {
      await this.auth.completePhoneRegistration(this.phone.trim(), this.password, this.username.trim())
      this.step.set('success')
      setTimeout(() => this.router.navigate(['/']), 5000)
    } catch (e: any) {
      this.errorMsg.set(e.message ?? 'Đăng ký thất bại')
    } finally {
      this.loading.set(false)
    }
  }

  goBack() {
    if (this.step() === 'phone') this.step.set('form')
    else if (this.step() === 'otp') this.step.set('phone')
  }

 trackByIndex(index: number): number {
  return index
}

onOtpInput(index: number, event: Event) {
  const input = event.target as HTMLInputElement
  const value = input.value.replace(/\D/g, '').slice(-1)

  // Tạo mảng mới thay vì mutate trực tiếp, đảm bảo change detection chuẩn
  this.otpDigits = this.otpDigits.map((d, i) => (i === index ? value : d))
  input.value = value

  if (value && index < 3) {
    const next = document.getElementById(`otp-${index + 1}`) as HTMLInputElement
    next?.focus()
  }
}

onOtpKeydown(index: number, event: KeyboardEvent) {
  // Backspace khi ô đang rỗng thì nhảy lùi về ô trước, đúng UX OTP chuẩn
  if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
    const prev = document.getElementById(`otp-${index - 1}`) as HTMLInputElement
    prev?.focus()
  }
}
}