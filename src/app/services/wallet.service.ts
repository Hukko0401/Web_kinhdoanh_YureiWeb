import { Injectable } from '@angular/core'
import { supabase } from '../supabase.client'

export interface TopupPackage {
  packageId: string;
  name: string;
  price: number;
  coinAmount: number;
  bonusCoin: number;
}

export interface TopupTransactionResult {
  transactionId: string;
  price: number;
  totalCoin: number;
}

export interface WalletTransaction {
  transactionId: string;
  type: 'topup' | 'roll' | 'order' | 'exchange';
  amount: number;
  status: 'pending' | 'success' | 'failed';
  time: string;
  paymentGateway: string | null;
}

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

  // Helper nội bộ: lấy wallet_id (cần cho query TRANSACTION), không đụng tới getBalance
  private async getWalletId(user_id: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('WALLET')
      .select('wallet_id')
      .eq('user_id', user_id)
      .single();

    if (error || !data) {
      console.error('getWalletId failed:', error?.message);
      return null;
    }

    return data.wallet_id;
  }

  // Lấy lịch sử giao dịch
  async getTransactions(user_id: string): Promise<WalletTransaction[]> {
    const walletId = await this.getWalletId(user_id);
    if (!walletId) return [];

    const { data, error } = await supabase
      .from('TRANSACTION')
      .select('transaction_id, type, amount, status, time, payment_gateway')
      .eq('wallet_id', walletId)
      .order('time', { ascending: false });

    if (error) {
      console.error('getTransactions failed:', error.message);
      return [];
    }

    return (data ?? []).map((row: any) => ({
      transactionId: row.transaction_id,
      type: row.type,
      amount: row.amount,
      status: row.status,
      time: row.time,
      paymentGateway: row.payment_gateway,
    }));
  }

  // Lấy danh sách gói topup
  async getTopupPackages(): Promise<TopupPackage[]> {
    const { data, error } = await supabase
      .from('TOPUP_PACKAGE')
      .select('package_id, name, price, coin_amount, bonus_coin')
      .eq('is_active', true)
      .order('price', { ascending: true });

    if (error) {
      console.error('getTopupPackages failed:', error.message);
      return [];
    }

    return (data ?? []).map((row: any) => ({
      packageId: row.package_id,
      name: row.name,
      price: row.price,
      coinAmount: row.coin_amount,
      bonusCoin: row.bonus_coin ?? 0,
    }));
  }

  async createTopupTransaction(packageId: string, mock: boolean): Promise<TopupTransactionResult | null> {
    const { data, error } = await supabase.rpc('create_topup_transaction', {
      p_package_id: packageId,
      p_mock: mock,
    });

    if (error) {
      console.error('createTopupTransaction failed:', error.message);
      return null;
    }

    return {
      transactionId: data.transaction_id,
      price: data.price,
      totalCoin: data.total_coin,
    };
  }

  async createTopupPaymentUrl(transactionId: string): Promise<string | null> {
    const { data, error } = await supabase.functions.invoke('create-topup-payment-url', {
      body: { transactionId },
    });

    if (error) {
      console.error('createTopupPaymentUrl failed:', error.message);
      return null;
    }

    return data?.paymentUrl ?? null;
  }
}