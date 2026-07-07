import { Injectable } from '@angular/core'
import { supabase } from '../supabase.client'

@Injectable({ providedIn: 'root' })
export class OrderService {

  // Tạo order mới
async createOrder(user_id: string, items: any[], address: string) {}

  // Lấy lịch sử order
async getOrderHistory(user_id: string) {}

  // Huỷ order (trong 30 phút)
async cancelOrder(order_id: string) {}

  // Lấy chi tiết order
async getOrderById(order_id: string) {}

}