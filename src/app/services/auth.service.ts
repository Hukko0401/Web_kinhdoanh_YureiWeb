import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import { supabase } from '../supabase.client'
import { User } from '@supabase/supabase-js'

const PENDING_USERNAME_KEY = 'yurei_pending_username'

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null)
  currentUser$ = this.currentUserSubject.asObservable()

  // OTP giả lập lưu tạm trong RAM (không persist), key = phone
  private otpStore = new Map<string, string>()

  constructor() {
    // ⚠️ TODO: FAKE LOGIN — xóa khối này trước khi nộp bài / demo thật
    const FAKE_LOGIN = false
    if (FAKE_LOGIN) {
      const fakeUser: User = {
        id: 'fake-user-id',
        email: 'test@yurei.com',
        app_metadata: {},
        user_metadata: { username: 'TestUser' },
        aud: 'authenticated',
        created_at: new Date().toISOString()
      }
      this.currentUserSubject.next(fakeUser)
    } else {
      supabase.auth.getUser().then(({ data: { user } }) => {
        this.currentUserSubject.next(user)
      })
    }
    // ⚠️ END FAKE LOGIN

    supabase.auth.onAuthStateChange((_event, session) => {
      if (FAKE_LOGIN) return
      this.currentUserSubject.next(session?.user ?? null)
    })
  }

  // ===== EMAIL/PASSWORD (giữ chỗ, chưa dùng trong luồng hiện tại) =====
  async register(email: string, password: string, username: string) {}
  async login(identifier: string, password: string) {
  let email: string

  if (identifier.includes('@')) {
    email = identifier.trim()
  } else {
   const { data, error } = await supabase
  .from('user_lookup')
  .select('email')
  .eq('phone_number', identifier.trim())
  .maybeSingle()

if (error || !data) {
  throw new Error('Không tìm thấy tài khoản với số điện thoại này')
}
email = data.email
  }

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
  if (signInError) throw signInError
  return signInData.user
}

  // ===== GOOGLE OAUTH =====
  /**
   * Bắt đầu đăng ký/đăng nhập bằng Google.
   * username được lưu tạm vào sessionStorage vì trình duyệt sẽ rời app
   * để qua trang Google, rồi mới quay lại /auth-callback.
   */
  async loginWithGoogle(username?: string) {
  if (username) {
    sessionStorage.setItem(PENDING_USERNAME_KEY, username)
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth-callback`
    }
  })
  if (error) throw error
}

  /** Gọi ở AuthCallbackComponent sau khi Supabase redirect về */
  async ensureUserProfileAfterOAuth(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No user session found after OAuth')

    const { data: existing } = await supabase
      .from('USER')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (existing) return // đã có profile, không cần tạo lại

    const pendingUsername = sessionStorage.getItem(PENDING_USERNAME_KEY)
    const username = pendingUsername || user.email?.split('@')[0] || `user_${user.id.slice(0, 6)}`

    const { error } = await supabase.from('USER').insert({
      user_id: user.id,
      email: user.email,
      username,
      role: 'customer'
    })
    if (error) throw error

    const { error: customerError } = await supabase.from('CUSTOMER').insert({ user_id: user.id })
    if (customerError) throw customerError

    const { error: walletError } = await supabase.from('WALLET').insert({ user_id: user.id, balance: 0 })
    if (walletError) throw walletError

    sessionStorage.removeItem(PENDING_USERNAME_KEY)
  }

  // ===== PHONE (GIẢ LẬP OTP) =====
  private generateFakeEmail(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  return `phone${digits}@yureiapp.com` // đổi .local -> .com, thêm prefix "phone" tránh trùng email thật ai đó
}

  private generateOtpCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString() // 4 chữ số
  }

  /**
   * Gửi OTP giả lập. Trả về code để component hiển thị demo
   * (vì không có SMS gateway thật).
   */
  sendFakeOtp(phone: string): string {
    const code = this.generateOtpCode()
    this.otpStore.set(phone, code)
    return code
  }

  verifyFakeOtp(phone: string, code: string): boolean {
    return this.otpStore.get(phone) === code
  }

  /**
   * Hoàn tất đăng ký sau khi OTP khớp: tạo auth.users bằng fake email
   * rồi insert profile vào bảng USER.
   */
  async completePhoneRegistration(phone: string, password: string, username: string) {
  const fakeEmail = this.generateFakeEmail(phone)

  const { data, error } = await supabase.auth.signUp({
    email: fakeEmail,
    password
  })
  if (error) throw error

  let user = data.user
  if (!user) throw new Error('Không tạo được tài khoản')

  // Confirm email đang bật (cần cho luồng email thật) -> signUp() ở nhánh phone này
  // sẽ KHÔNG trả session, vì fake email không có hộp thư thật để confirm.
  // Chủ động sign in lại ngay để có session hợp lệ, né RLS.
  if (!data.session) {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: fakeEmail,
      password
    })
    if (signInError) throw signInError
    user = signInData.user
  }

  const { error: insertError } = await supabase.from('USER').insert({
    user_id: user.id,
    email: fakeEmail,
    phone_number: phone,
    username,
    role: 'customer'
  })
  if (insertError) throw insertError

  const { error: customerError } = await supabase.from('CUSTOMER').insert({ user_id: user.id })
  if (customerError) throw customerError

  const { error: walletError } = await supabase.from('WALLET').insert({ user_id: user.id, balance: 0 })
  if (walletError) throw walletError

  this.otpStore.delete(phone)
  return user
}

  async logout() {
    await supabase.auth.signOut()
  }

  async checkUsernameExists(username: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('check_username_exists', { p_username: username.trim() })
  if (error) {
    console.error('checkUsernameExists error:', error)
    return false
  }
  return !!data
}

async checkPhoneExists(phone: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('check_phone_exists', { p_phone: phone.trim() })
  if (error) {
    console.error('checkPhoneExists error:', error)
    return false
  }
  return !!data
}

  getCurrentUser(): User | null {
    return this.currentUserSubject.value
  }

  async getCurrentUserAsync(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    this.currentUserSubject.next(user)
    return user
  }

  setRememberMe(remember: boolean) {
  localStorage.setItem('yurei_remember_me', remember ? 'true' : 'false')
}

async sendPasswordReset(identifier: string) {
  let email: string

  if (identifier.includes('@')) {
    email = identifier.trim()
  } else {
    const { data, error } = await supabase
      .from('user_lookup')  // ← đổi từ 'USER' sang view này
      .select('email')
      .eq('phone_number', identifier.trim())
      .maybeSingle()

    if (error || !data) {
      throw new Error('Không tìm thấy tài khoản với số điện thoại này')
    }
    email = data.email
  }

  const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  })
  if (resetError) throw resetError
}
}