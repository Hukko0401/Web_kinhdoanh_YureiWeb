import { Injectable } from '@angular/core'
import { supabase } from '../supabase.client'

@Injectable({ providedIn: 'root' })
export class AddressService {

  // Lấy danh sách địa chỉ
async getAddresses(user_id: string) {}

  // Thêm địa chỉ mới
async addAddress(user_id: string, address: any) {}

  // Xoá địa chỉ
async deleteAddress(address_id: string) {}

  // Set địa chỉ mặc định
async setDefault(address_id: string, user_id: string) {}

}