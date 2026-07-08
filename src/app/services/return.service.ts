import { Injectable, signal } from '@angular/core';
import { supabase } from '../supabase.client';

@Injectable({ providedIn: 'root' })
export class ReturnRequestService {
  loading = signal(false);
  error = signal<string | null>(null);

  // Map: order_id -> Set(item_id đã request return)
  returnedItemIdsByOrder = signal<Map<string, Set<string>>>(new Map());

  getReturnedItemIds(orderId: string): Set<string> {
    return this.returnedItemIdsByOrder().get(orderId) ?? new Set<string>();
  }

  // Gọi 1 lần sau khi load xong danh sách order
  async loadReturnedItems(orderIds: string[]) {
    if (orderIds.length === 0) return;

    const { data, error } = await supabase
      .from('RETURN_REQUEST')
      .select(`
        order_id,
        RETURN_REQUEST_ITEM ( item_id )
      `)
      .in('order_id', orderIds);

    if (error) {
      this.error.set(error.message);
      return;
    }

    const map = new Map<string, Set<string>>();
    (data ?? []).forEach((r: any) => {
      const set = map.get(r.order_id) ?? new Set<string>();
      (r.RETURN_REQUEST_ITEM ?? []).forEach((ri: any) => set.add(ri.item_id));
      map.set(r.order_id, set);
    });

    this.returnedItemIdsByOrder.set(map);
  }

  // TODO: images hiện đang lưu base64 preview.
  // Nên đổi thành upload thật lên Supabase Storage rồi lưu URL vào đây.
  async createReturnRequest(
    orderId: string,
    items: { itemId: string; quantity: number }[],
    reason: string,
    images: string[]
  ): Promise<boolean> {
    this.loading.set(true);
    this.error.set(null);

    const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);

    const { data, error } = await supabase
      .from('RETURN_REQUEST')
      .insert({
        order_id: orderId,
        quantity: totalQuantity,
        reason,
        images,
        status: 'pending'
      })
      .select('return_id')
      .single();

    if (error || !data) {
      this.error.set(error?.message ?? 'Không thể tạo yêu cầu trả hàng');
      this.loading.set(false);
      return false;
    }

    const returnRequestId = data.return_id;

    const itemRows = items.map(i => ({
      return_id: returnRequestId,
      item_id: i.itemId,
      quantity: i.quantity
    }));

    const { error: itemError } = await supabase
      .from('RETURN_REQUEST_ITEM')
      .insert(itemRows);

    if (itemError) {
      this.error.set(itemError.message);
      this.loading.set(false);
      return false;
    }

    // Cập nhật state local ngay, không cần load lại từ DB
    const map = new Map(this.returnedItemIdsByOrder());
    const set = new Set(map.get(orderId) ?? []);
    items.forEach(i => set.add(i.itemId));
    map.set(orderId, set);
    this.returnedItemIdsByOrder.set(map);

    this.loading.set(false);
    return true;
  }
}