import { Injectable } from '@angular/core'
import { supabase } from '../supabase.client'

@Injectable({ providedIn: 'root' })
export class ReturnService {

  // Tạo yêu cầu hoàn trả
async createReturnRequest(order_id: string, reason: string, images: string) {}

  // Lấy lịch sử hoàn trả
async getReturnRequests(user_id: string) {}

}