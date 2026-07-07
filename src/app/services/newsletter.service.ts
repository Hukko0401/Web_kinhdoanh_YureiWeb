import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';
import { AuthService } from './auth.service';

export interface SubscribeResult {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class NewsletterService {

  constructor(
    private authService: AuthService
  ) {}

  async subscribe(email: string): Promise<SubscribeResult> {
  email = email.trim().toLowerCase()

  if (!email) {
    return { success: false, message: 'Please enter your email.' }
  }

  const currentUser = this.authService.getCurrentUser()
  const userId = currentUser?.id === 'fake-user-id' ? null : currentUser?.id ?? null

  // Thay .select() bằng RPC an toàn
  const { data: status, error: checkError } = await supabase.rpc('get_newsletter_status', {
    check_email: email
  })

  if (checkError) {
    return { success: false, message: checkError.message }
  }

  if (status === 'active') {
    return { success: false, message: 'This email has already been subscribed.' }
  }

  if (status === 'unsubscribed') {
    // Update vẫn cần xác định đúng row -> vì không có 'id' từ RPC, update theo email luôn
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ status: 'active', user_id: userId, source: 'footer' })
      .eq('email', email)

    if (error) return { success: false, message: error.message }
    return { success: true, message: 'Welcome back! Your subscription has been restored.' }
  }

  // status === null/undefined -> chưa từng subscribe
  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email, user_id: userId, source: 'footer' })
  console.log('INSERT result:', { error }) // ← thêm dòng này

  if (error) {
    return { success: false, message: error.message }
  }

  return { success: true, message: 'Subscribed successfully!' }
}

  // Kiểm tra email đã subscribe chưa
async isSubscribed(email: string): Promise<boolean> {
  email = email.trim().toLowerCase()
  if (!email) return false

  const { data: status, error } = await supabase.rpc('get_newsletter_status', {
    check_email: email
  })
  console.log('RPC result:', { status, error }) // ← thêm dòng này tạm thời

  if (error) return false
  return status === 'active'
}

}