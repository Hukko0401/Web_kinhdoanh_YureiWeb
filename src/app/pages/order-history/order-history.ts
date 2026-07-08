import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { OrderService, StatusFilter, OrderWithDetails } from '../../services/order.service';
import { ReturnRequestService } from '../../services/return.service';
import { AuthService } from '../../services/auth.service';
import { Header } from '../../components/header/header';

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
  private authService = inject(AuthService);
  private router = inject(Router);

  statusFilters: StatusFilter[] = ['All', 'processing', 'shipping', 'completed'];

  // ===== State cho panel Request Return =====
  selectedOrderForReturn = signal<OrderWithDetails | null>(null);
  selectedReturnItemIds = signal<Set<string>>(new Set());
  returnReason = signal('');
  returnPhotos = signal<string[]>([]);

  filterLabelFor(status: StatusFilter): string {
    const label = status === 'All' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1);
    return `${label} (${this.orderService.statusCountFor(status)})`;
  }

  selectStatus(status: StatusFilter) {
    this.orderService.setStatusFilter(status);
  }

  onViewDetails(event: Event, orderId: string) {
    event.stopPropagation();
    this.router.navigate(['/order-detail', orderId]);
  }

  // ===== Request Return panel =====

  onRequestReturn(event: Event, orderId: string) {
    event.stopPropagation();
    const order = this.orderService.orders().find(o => o.order_id === orderId);
    if (!order) return;

    this.selectedOrderForReturn.set(order);
    this.selectedReturnItemIds.set(new Set());
    this.returnReason.set('');
    this.returnPhotos.set([]);
  }

  returnableItems(order: OrderWithDetails) {
    const returnedIds = this.returnRequestService.getReturnedItemIds(order.order_id);
    return order.items.filter(i => !returnedIds.has(i.item_id));
  }

  hasReturnableItems(order: OrderWithDetails): boolean {
      return this.returnableItems(order).length > 0;
  }

  closeReturnPanel() {
    this.selectedOrderForReturn.set(null);
  }

  isReturnItemSelected(itemId: string): boolean {
    return this.selectedReturnItemIds().has(itemId);
  }

  toggleReturnItem(itemId: string) {
    const current = new Set(this.selectedReturnItemIds());
    if (current.has(itemId)) {
      current.delete(itemId);
    } else {
      current.add(itemId);
    }
    this.selectedReturnItemIds.set(current);
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

    const selectedItems = order.items.filter(i => this.selectedReturnItemIds().has(i.item_id));

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
    const userId = this.authService.getCurrentUser()?.id;
    if (!userId) {
      this.orderService.error.set('Bạn cần đăng nhập để xem lịch sử đơn hàng.');
      return;
    }
    await this.orderService.loadOrderHistory(userId);

    const orderIds = this.orderService.orders().map(o => o.order_id);
    await this.returnRequestService.loadReturnedItems(orderIds);
  }
}