import { Injectable } from '@angular/core'
import { supabase } from '../supabase.client'

@Injectable({ providedIn: 'root' })
export class NotificationService {

  // Lấy thông báo của user
async getNotifications(user_id: string) {}

  // Đánh dấu đã đọc
async markAsRead(user_notif_id: string) {}

  // Đánh dấu tất cả đã đọc
async markAllAsRead(user_id: string) {}

}