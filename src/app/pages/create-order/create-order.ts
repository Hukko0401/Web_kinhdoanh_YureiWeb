// src/app/pages/create-order/create-order.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { OrderDraftService } from '../../services/order-draft.service';
import { ShippingAddressService, ShippingAddress } from '../../services/shipping-address.service';
import { Header } from '../../components/header/header';
import { supabase } from '../../supabase.client';
import { InventoryItem,InventoryService } from '../../services/inventory.service';
import { AddAddressModal } from '../../components/add-address-modal/add-address-modal';

export type PaymentGateway = 'vnpay' | 'momo' | 'zalopay';

@Component({
  selector: 'app-create-order',
  standalone: true,
  imports: [CommonModule, RouterModule, Header,AddAddressModal],
  templateUrl: './create-order.html',
  styleUrl: './create-order.scss',
})
export class CreateOrder implements OnInit {
  orderDraftService = inject(OrderDraftService);
  shippingAddressService = inject(ShippingAddressService);
  private router = inject(Router);
  inventoryService = inject(InventoryService);
  editingAddress = signal<ShippingAddress | null>(null);
  selectedAddressId = signal<string | null>(null);
  selectedPayment = signal<PaymentGateway>('vnpay');
  addressListExpanded = signal(false);
  showAddAddressModal = signal(false);
  showSuccessModal = signal(false);
  submitting = signal(false);
  errorMsg = signal<string | null>(null);
  shipQuantities = signal<Map<string, number>>(new Map());

  selectedAddress = computed(() => {
    const id = this.selectedAddressId();
    return this.shippingAddressService.addresses().find(a => a.addressId === id) ?? null;
  });

  shippingFee = computed(() => {
    const addr = this.selectedAddress();
    if (!addr) return 0;
    return this.shippingAddressService.calculateShippingFee(addr);
  });

  totalAmount = computed(() => this.shippingFee()); // chỉ tính phí ship, item không mất tiền thêm

  // Sửa lại ngOnInit — thêm khởi tạo map sau khi có draft
async ngOnInit(): Promise<void> {
  if (!this.orderDraftService.hasDraft()) {
    this.router.navigate(['/inventory']);
    return;
  }

  // Khởi tạo mỗi item mặc định ship = 1
  const initialMap = new Map<string, number>();
  for (const item of this.orderDraftService.selectedItems()) {
    initialMap.set(item.userInventoryId, 1);
  }
  this.shipQuantities.set(initialMap);

  await this.shippingAddressService.loadAddresses();

  const def = this.shippingAddressService.defaultAddress();
  if (def) {
    this.selectedAddressId.set(def.addressId);
  }
}

getShipQty(userInventoryId: string): number {
  return this.shipQuantities().get(userInventoryId) ?? 1;
}

incrementQty(item: InventoryItem): void {
  const map = new Map(this.shipQuantities());
  const current = map.get(item.userInventoryId) ?? 1;
  if (current < item.quantity) {
    map.set(item.userInventoryId, current + 1);
    this.shipQuantities.set(map);
  }
}

decrementQty(item: InventoryItem): void {
  const map = new Map(this.shipQuantities());
  const current = map.get(item.userInventoryId) ?? 1;
  if (current > 1) {
    map.set(item.userInventoryId, current - 1);
    this.shipQuantities.set(map);
  }
}

// Sửa itemCount -> tổng quantity thay vì đếm số card
itemCount = computed(() => {
  let total = 0;
  for (const qty of this.shipQuantities().values()) {
    total += qty;
  }
  return total;
});

  removeItemFromDraft(userInventoryId: string): void {
  const current = this.orderDraftService.selectedItems();
  const updated = current.filter(i => i.userInventoryId !== userInventoryId);
  this.orderDraftService.setDraft(updated);

  const map = new Map(this.shipQuantities());
  map.delete(userInventoryId);
  this.shipQuantities.set(map);

  if (updated.length === 0) {
    this.router.navigate(['/inventory']);
  }
}

  selectAddress(addressId: string): void {
    this.selectedAddressId.set(addressId);
    this.addressListExpanded.set(false);
  }

  toggleAddressList(): void {
    this.addressListExpanded.set(!this.addressListExpanded());
  }

  selectPayment(method: PaymentGateway): void {
    this.selectedPayment.set(method);
  }

  goBackInventory(): void {
    this.router.navigate(['/inventory']);
  }

  async confirmCreateOrder(): Promise<void> {
  const address = this.selectedAddress();
  if (!address) {
    this.errorMsg.set('Vui lòng chọn địa chỉ giao hàng');
    return;
  }

  this.submitting.set(true);
  this.errorMsg.set(null);

  const items = this.orderDraftService.selectedItems().map(item => ({
    item_id: item.itemId,
    quantity: this.getShipQty(item.userInventoryId),
  }));

  const isMock = false; // không còn gateway nào mock nữa, cả 3 đều đi luồng thật

  const { data, error } = await supabase.rpc('create_order', {
    p_address_id: address.addressId,
    p_payment_gateway: this.selectedPayment(),
    p_shipping_fee: this.shippingFee(),
    p_items: items,
    p_mock: isMock,
  });

  if (error) {
    this.submitting.set(false);
    this.errorMsg.set(error.message);
    return;
  }

  if (isMock) {
    this.submitting.set(false);
    this.showSuccessModal.set(true);
    return;
  }

  const orderId = data.order_id;

  // VNPay/MoMo: gọi đúng Edge Function theo gateway đã chọn, lấy URL rồi redirect
  const functionName =
  this.selectedPayment() === 'momo' ? 'create-momo-payment' :
  this.selectedPayment() === 'zalopay' ? 'create-zalopay-payment' :
  'create-payment-url';

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    const res = await fetch(`https://rhblxxtrjjwpeaeikhny.supabase.co/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ orderId }),
    });

    const result = await res.json();

    if (!res.ok || result.error) {
      await supabase.rpc('cancel_order', { p_order_id: orderId });
      this.submitting.set(false);
      this.errorMsg.set(result.error ?? 'Không tạo được URL thanh toán');
      return;
    }

    window.location.href = result.paymentUrl; // redirect sang cổng thanh toán tương ứng
    // không set submitting = false ở đây vì trang sắp bị redirect đi
  } catch (err) {
    await supabase.rpc('cancel_order', { p_order_id: orderId });
    this.submitting.set(false);
    this.errorMsg.set('Không thể kết nối tới cổng thanh toán, vui lòng thử lại');
  }
}
// Thêm vào class CreateOrder

openAddAddressModal(): void {
  this.editingAddress.set(null);   // đảm bảo mở ở chế độ "add"
  this.showAddAddressModal.set(true);
}

openEditAddressModal(addr: ShippingAddress, event: Event): void {
  event.stopPropagation();          // tránh trigger selectAddress() của card
  this.editingAddress.set(addr);
  this.showAddAddressModal.set(true);
}

closeAddAddressModal(): void {
  this.showAddAddressModal.set(false);
}

async onAddressAdded(): Promise<void> {
  this.showAddAddressModal.set(false);
  // reload đã tự chạy trong addAddress(), chỉ cần chọn lại default mới nếu có
  const def = this.shippingAddressService.defaultAddress();
  if (def) this.selectedAddressId.set(def.addressId);
}

async deleteAddress(addressId: string, event: Event): Promise<void> {
  event.stopPropagation();
  await this.shippingAddressService.deleteAddress(addressId);
  if (this.selectedAddressId() === addressId) {
    const def = this.shippingAddressService.defaultAddress();
    this.selectedAddressId.set(def?.addressId ?? null);
  }
}

getPaymentIcon(method: PaymentGateway): string {
  return `/Icons/${method}.png`;
}
onSuccessClose(): void {
  this.showSuccessModal.set(false);
  this.orderDraftService.clearDraft();
  this.router.navigate(['/inventory']);
}
}