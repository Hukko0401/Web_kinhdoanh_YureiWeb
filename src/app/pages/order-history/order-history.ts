import { Component, OnInit, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { OrderService, StatusFilter, OrderWithDetails } from '../../services/order.service';
import { ReturnRequestService } from '../../services/return.service';
import { AuthService } from '../../services/auth.service';
import { Header } from '../../components/header/header';
import { Transaction } from '../../models/transaction.model';
import { ShippingAddressService } from '../../services/shipping-address.service';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterModule, Header],
  templateUrl: './order-history.html',
  styleUrl: './order-history.scss'
})
export class OrderHistory implements OnInit {
  orderService = inject(OrderService);
  returnRequestService = inject(ReturnRequestService);
  shippingAddressService = inject(ShippingAddressService);
  private authService = inject(AuthService);
  private router = inject(Router);

  statusFilters: StatusFilter[] = ['All', 'processing', 'shipping', 'completed'];

  // ===== State cho panel Request Return =====
  selectedOrderForReturn = signal<OrderWithDetails | null>(null);
  selectedReturnQuantities = signal<Map<string, number>>(new Map());
  returnReason = signal('');
  returnPhotos = signal<string[]>([]);

  // ===== State cho panel View Details =====
  selectedOrderForDetails = signal<OrderWithDetails | null>(null);
  selectedOrderTransaction = signal<Transaction | null>(null);

  filterLabelFor(status: StatusFilter): string {
    const label = status === 'All' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1);
    return `${label} (${this.orderService.statusCountFor(status)})`;
  }

  selectStatus(status: StatusFilter) {
    this.orderService.setStatusFilter(status);
  }

  // ===== Scale nội dung theo bề rộng màn hình =====
  private readonly DESIGN_WIDTH = 1440; // bề rộng thiết kế gốc (đo theo Figma/ảnh 1)

  pageScale = signal(1);

  @HostListener('window:resize')
  onWindowResize() {
    this.updatePageScale();
  }

  private updatePageScale() {
    const scale = Math.min(window.innerWidth / this.DESIGN_WIDTH, 1);
    this.pageScale.set(scale);
  }

  // ===== Request Return panel =====

  onRequestReturn(event: Event, orderId: string) {
    event.stopPropagation();
    this.selectedOrderForDetails.set(null);
    this.selectedOrderTransaction.set(null);

    const order = this.orderService.orders().find(o => o.order_id === orderId);
    if (!order) return;

    this.selectedOrderForReturn.set(order);
    this.selectedReturnQuantities.set(new Map());
    this.returnReason.set('');
    this.returnPhotos.set([]);
  }

  returnableItems(order: OrderWithDetails) {
    return order.items
      .map(item => {
        const returnedQty = this.returnRequestService.getReturnedQty(order.order_id, item.item_id);
        const remainingQty = item.quantity - returnedQty;
        return { ...item, quantity: remainingQty };
      })
      .filter(item => item.quantity > 0);
  }

  hasReturnableItems(order: OrderWithDetails): boolean {
      return this.returnableItems(order).length > 0;
  }

  closeReturnPanel() {
    this.selectedOrderForReturn.set(null);
  }

  getReturnQty(itemId: string): number {
    return this.selectedReturnQuantities().get(itemId) ?? 0;
  }

  isReturnItemSelected(itemId: string): boolean {
      return this.getReturnQty(itemId) > 0;
  }

  toggleReturnItem(itemId: string, maxQty: number) {
      const current = new Map(this.selectedReturnQuantities());
      if (current.has(itemId)) {
        current.delete(itemId);
      } else {
        current.set(itemId, 1); // mặc định chọn 1 khi vừa tick
      }
      this.selectedReturnQuantities.set(current);
  }

  incrementReturnQty(itemId: string, maxQty: number) {
      const current = new Map(this.selectedReturnQuantities());
      const qty = current.get(itemId) ?? 0;
      if (qty < maxQty) {
        current.set(itemId, qty + 1);
        this.selectedReturnQuantities.set(current);
      }
  }

  decrementReturnQty(itemId: string) {
      const current = new Map(this.selectedReturnQuantities());
      const qty = current.get(itemId) ?? 0;
      if (qty > 1) {
        current.set(itemId, qty - 1);
        this.selectedReturnQuantities.set(current);
      } else if (qty === 1) {
        current.delete(itemId); // về 0 thì bỏ chọn luôn
        this.selectedReturnQuantities.set(current);
      }
  }

  onReasonInput(event: Event) {
    const value = (event.target as HTMLTextAreaElement).value;
    this.returnReason.set(value);
  }

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const remainingSlots = 4 - this.returnPhotos().length;
    const files = Array.from(input.files).slice(0, remainingSlots);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        this.returnPhotos.update(list => [...list, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    input.value = '';
  }

  removePhoto(index: number) {
    this.returnPhotos.update(list => list.filter((_, i) => i !== index));
  }

  async onSubmitReturnRequest() {
    const order = this.selectedOrderForReturn();
    if (!order) return;

    const quantities = this.selectedReturnQuantities();
    const selectedItems = order.items
          .filter(i => (quantities.get(i.item_id) ?? 0) > 0)
          .map(i => ({ ...i, quantity: quantities.get(i.item_id)! }));

    if (selectedItems.length === 0) {
          alert('Vui lòng chọn ít nhất 1 sản phẩm cần trả.');
          return;
    }
    if (!this.returnReason().trim()) {
      alert('Vui lòng nhập lý do trả hàng.');
      return;
    }
    if (this.returnPhotos().length === 0) {
      alert('Vui lòng thêm ít nhất 1 ảnh minh chứng.');
      return;
    }

    const itemsPayload = selectedItems.map(i => ({ itemId: i.item_id, quantity: i.quantity }));

    const success = await this.returnRequestService.createReturnRequest(
      order.order_id,
      itemsPayload,
      this.returnReason(),
      this.returnPhotos()
    );

    if (success) {
      this.closeReturnPanel();
    }
  }

  async ngOnInit() {
    this.updatePageScale();
    const userId = this.authService.getCurrentUser()?.id;
    if (!userId) {
      this.orderService.error.set('Bạn cần đăng nhập để xem lịch sử đơn hàng.');
      return;
    }
    await this.orderService.loadOrderHistory(userId);
    await this.shippingAddressService.loadAddresses();

    const orderIds = this.orderService.orders().map(o => o.order_id);
    await this.returnRequestService.loadReturnedItems(orderIds);
  }

  // ===== View Details panel =====
  async onViewDetails(event: Event, orderId: string) {
      event.stopPropagation();
      const order = this.orderService.orders().find(o => o.order_id === orderId);
      if (!order) return;

      this.selectedOrderForReturn.set(null); // đóng panel Return nếu đang mở
      this.selectedOrderTransaction.set(null);

      const matchedAddress = this.shippingAddressService.addresses().find(
        a => a.address === order.address
      );

      this.selectedOrderForDetails.set({
        ...order,
        address_label: matchedAddress?.label ?? null
      });

      const transaction = await this.orderService.getTransactionForOrder(orderId);
      this.selectedOrderTransaction.set(transaction);
  }

  closeDetailsPanel() {
      this.selectedOrderForDetails.set(null);
      this.selectedOrderTransaction.set(null);
  }

  statusStepIndex(status: string): number {
      switch (status) {
        case 'processing': return 0;
        case 'shipping': return 1;
        case 'completed': return 2;
        default: return 0;
      }
  }

  canCancelInDetail(order: OrderWithDetails): boolean {
    return this.orderService.canCancelOrder(order);
  }

  async onCancelOrderDetail() {
      const order = this.selectedOrderForDetails();
      if (!order) return;
      if (!confirm('Bạn có chắc muốn huỷ đơn hàng này?')) return;

      const success = await this.orderService.cancelOrder(order.order_id);
      if (success) {
        this.selectedOrderForDetails.set({ ...order, status: 'cancelled' });
      }
  }

  paymentGatewayLabel(gateway: string | undefined): string {
      switch (gateway) {
        case 'vnpay': return 'VNPay';
        case 'momo': return 'MoMo';
        case 'zalopay': return 'ZaloPay';
        default: return 'N/A';
      }
  }
}