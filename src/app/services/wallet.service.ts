import { Injectable } from '@angular/core'
import { supabase } from '../supabase.client'

@Injectable({ providedIn: 'root' })
export class WalletService {

  // Lấy số dư ví
  async getBalance(user_id: string): Promise<{ data: number; error: string | null }> {
    const { data, error } = await supabase.rpc('get_wallet_balance', {
      p_user_id: user_id
    })

    if (error) {
      return { data: 0, error: error.message }
    }

    // RPC trả về numeric đơn (không phải mảng), Postgres NULL nếu không tìm thấy wallet
    return { data: data ?? 0, error: null }
  }

  // Lấy lịch sử giao dịch
async getTransactions(user_id: string) {}

  // Lấy danh sách gói topup
async getTopupPackages() {}

}