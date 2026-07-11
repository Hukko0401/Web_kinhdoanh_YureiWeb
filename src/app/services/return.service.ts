import { Injectable, signal } from '@angular/core';
import { supabase } from '../supabase.client';

@Injectable({ providedIn: 'root' })
export class ReturnRequestService {
  loading = signal(false);
  error = signal<string | null>(null);

  // Map: order_id -> Map(item_id -> tổng số lượng đã request return)
  returnedQtyByOrder = signal<Map<string, Map<string, number>>>(new Map());

  getReturnedQty(orderId: string, itemId: string): number {
    return this.returnedQtyByOrder().get(orderId)?.get(itemId) ?? 0;
  }

  async loadReturnedItems(orderIds: string[]) {
    if (orderIds.length === 0) return;

    const { data, error } = await supabase
      .from('RETURN_REQUEST')
      .select(`
        order_id,
        RETURN_REQUEST_ITEM ( item_id, quantity )
      `)
      .in('order_id', orderIds);

    if (error) {
      this.error.set(error.message);
      return;
    }

    const map = new Map<string, Map<string, number>>();
    (data ?? []).forEach((r: any) => {
      const itemMap = map.get(r.order_id) ?? new Map<string, number>();
      (r.RETURN_REQUEST_ITEM ?? []).forEach((ri: any) => {
        const current = itemMap.get(ri.item_id) ?? 0;
        itemMap.set(ri.item_id, current + ri.quantity);
      });
      map.set(r.order_id, itemMap);
    });

    this.returnedQtyByOrder.set(map);
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
      .select('return_request_id')
      .single();

    if (error || !data) {
      this.error.set(error?.message ?? 'Không thể tạo yêu cầu trả hàng');
      this.loading.set(false);
      return false;
    }

    const returnRequestId = data.return_request_id;

    const itemRows = items.map(i => ({
      return_request_id: returnRequestId,
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
    const map = new Map(this.returnedQtyByOrder());
    const itemMap = new Map(map.get(orderId) ?? new Map<string, number>());
    items.forEach(i => {
      const current = itemMap.get(i.itemId) ?? 0;
      itemMap.set(i.itemId, current + i.quantity);
    });
    map.set(orderId, itemMap);
    this.returnedQtyByOrder.set(map);

    this.loading.set(false);
    return true;
  }
}