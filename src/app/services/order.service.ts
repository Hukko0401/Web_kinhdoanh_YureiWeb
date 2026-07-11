import { Injectable, signal, computed } from '@angular/core'
import { supabase } from '../supabase.client'
import { Order } from '../models/order.model';
import { Transaction } from '../models/transaction.model';

export interface OrderDetailItem {
  item_id: string;
  name: string;
  image?: string;
  quantity: number;
}

// Interface nội bộ cho UI, không phải bảng DB
export interface OrderWithDetails extends Order {
  order_code: string;
  total: number;
  items: OrderDetailItem[];
  address_label?: string | null;
}

export type StatusFilter = 'All' | Order['status'];

@Injectable({ providedIn: 'root' })
export class OrderService {
  private rawOrders = signal<OrderWithDetails[]>([]);

  loading = signal(false);
  error = signal<string | null>(null);
  statusFilter = signal<StatusFilter>('All');

  orders = computed(() => this.rawOrders());

  filteredOrders = computed(() => {
    const filter = this.statusFilter();
    const list = this.rawOrders();
    if (filter === 'All') return list;
    return list.filter(o => o.status === filter);
  });

  statusCountFor(status: StatusFilter): number {
    const list = this.rawOrders();
    if (status === 'All') return list.length;
    return list.filter(o => o.status === status).length;
  }

  setStatusFilter(status: StatusFilter) {
    this.statusFilter.set(status);
  }

  private buildOrderCode(orderId: string, createdAt: string): string {
    const year = new Date(createdAt).getFullYear();
    const shortId = orderId.slice(0, 3).toUpperCase();
    return `${year}-${shortId}`;
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  formatCurrency(value: number): string {
    return `${value.toLocaleString('vi-VN')}đ`;
  }

  canCancelOrder(order: OrderWithDetails): boolean {
    if (order.status !== 'processing') {
      return false;
    }
    const diffMinutes = (Date.now() - new Date(order.created_at).getTime()) / (1000 * 60);
    return diffMinutes <= 30;
  }

  private mapOrderRow(o: any): OrderWithDetails {
    const items: OrderDetailItem[] = (o.ORDER_DETAILS ?? []).map((d: any): OrderDetailItem => ({
      item_id: d.item?.item_id,
      name: d.item?.name,
      image: d.item?.image,
      quantity: d.quantity
    }));

    return {
      order_id: o.order_id,
      user_id: o.user_id,
      status: o.status,
      receiver_name: o.receiver_name,
      receiver_phone: o.receiver_phone,
      address: o.address,
      shipping_fee: o.shipping_fee,
      created_at: o.created_at,
      order_code: this.buildOrderCode(o.order_id, o.created_at),
      total: o.shipping_fee ?? 0,
      items
    };
  }

  // Tạo order mới
async createOrder(user_id: string, items: any[], address: string) {}

  // Lấy lịch sử order
async loadOrderHistory(user_id: string) {
  this.loading.set(true);
    this.error.set(null);

    const { data, error } = await supabase
      .from('ORDER')
      .select(`
        order_id,
        user_id,
        receiver_name,
        receiver_phone,
        address,
        shipping_fee,
        status,
        created_at,
        ORDER_DETAILS (
          quantity,
          item:item_id ( item_id, name, image )
        )
      `)
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) {
      this.error.set(error.message);
      this.loading.set(false);
      return;
    }

    this.rawOrders.set((data ?? []).map((o: any) => this.mapOrderRow(o)));
    this.loading.set(false);
}

  // Huỷ order (trong 30 phút)
async cancelOrder(order_id: string): Promise<boolean> {
    this.loading.set(true);
    this.error.set(null);

    const current = this.rawOrders().find(o => o.order_id === order_id);

    if (current) {
      const diffMinutes = (Date.now() - new Date(current.created_at).getTime()) / (1000 * 60);
      if (diffMinutes > 30) {
        this.error.set('Đơn hàng chỉ có thể huỷ trong vòng 30 phút sau khi đặt.');
        this.loading.set(false);
        return false;
      }
    }

    const { error } = await supabase
      .from('ORDER')
      .update({ status: 'cancelled' })
      .eq('order_id', order_id);

    if (error) {
      this.error.set(error.message);
      this.loading.set(false);
      return false;
    }

    this.rawOrders.update(list =>
      list.map(o => o.order_id === order_id ? { ...o, status: 'cancelled' as const } : o)
    );

    this.loading.set(false);
    return true;
  }

  // Lấy chi tiết order
async getOrderById(order_id: string): Promise<OrderWithDetails | null> {
    this.loading.set(true);
    this.error.set(null);

    const { data, error } = await supabase
      .from('ORDER')
      .select(`
        order_id,
        user_id,
        receiver_name,
        receiver_phone,
        address,
        shipping_fee,
        status,
        created_at,
        ORDER_DETAILS (
          quantity,
          item:item_id ( item_id, name, image )
        )
      `)
      .eq('order_id', order_id)
      .single();

    this.loading.set(false);

    if (error) {
      this.error.set(error.message);
      return null;
    }
    if (!data) return null;

    return this.mapOrderRow(data);
  }

async getTransactionForOrder(orderId: string): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from('TRANSACTION')
      .select('transaction_id, wallet_id, type, amount, gateway_transaction_id, payment_gateway, reference_id, time, status')
      .eq('reference_id', orderId)
      .eq('type', 'order')
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data as Transaction;
  }

}