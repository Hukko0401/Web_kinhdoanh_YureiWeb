// src/app/components/exchange-modal/exchange-modal.ts
import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryItem, InventoryService } from '../../services/inventory.service';
import { WalletService } from '../../services/wallet.service';

@Component({
  selector: 'app-exchange-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exchange-modal.html',
  styleUrl: './exchange-modal.scss',
})
export class ExchangeModal {
  @Input({ required: true }) item!: InventoryItem;
  @Output() close = new EventEmitter<void>();
  @Output() exchanged = new EventEmitter<{ coinReceived: number; newBalance: number }>();

  quantity = signal(1);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private inventoryService: InventoryService,
    private walletService: WalletService   // thêm dòng này
  ) {}

  coinRate = computed(() => this.inventoryService.exchangeRates()[this.item.rarity]);
  totalCoin = computed(() => this.coinRate() * this.quantity());

  increment(): void {
    if (this.quantity() < this.item.quantity) {
      this.quantity.set(this.quantity() + 1);
    }
  }

  decrement(): void {
    if (this.quantity() > 1) {
      this.quantity.set(this.quantity() - 1);
    }
  }

  onBackdropClick(): void {
    this.close.emit();
  }

  inventoryServiceBadge(): string {
    return this.inventoryService.getRarityBadgePath(this.item.rarity);
  }

  async confirmExchange(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    const result = await this.inventoryService.exchangeItem(this.item.itemId, this.quantity());

    this.loading.set(false);

    if (!result.success) {
      this.error.set(result.error ?? 'Có lỗi xảy ra, thử lại sau');
      return;
    }

    // Đã có sẵn newBalance từ response -> đẩy thẳng vào balance$, khỏi gọi thêm API
    this.walletService.setBalance(result.newBalance!);

    this.exchanged.emit({
      coinReceived: result.coinReceived!,
      newBalance: result.newBalance!,
    });
  }
}