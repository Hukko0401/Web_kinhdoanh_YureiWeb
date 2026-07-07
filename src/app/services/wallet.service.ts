import { Injectable } from '@angular/core'
import { supabase } from '../supabase.client'

@Injectable({ providedIn: 'root' })
export class WalletService {

  // Lấy số dư ví
async getBalance(user_id: string) {}

  // Lấy lịch sử giao dịch
async getTransactions(user_id: string) {}

  // Lấy danh sách gói topup
async getTopupPackages() {}

}