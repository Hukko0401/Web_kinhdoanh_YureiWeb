import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InventoryService, InventoryItem } from '../../../services/inventory.service';
import { ExchangeModal } from '../../../components/exchange-modal/exchange-modal';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule, ExchangeModal],
  templateUrl: './favorites.html',
  styleUrl: './favorites.scss'
})
export class Favorites implements OnInit {
  inventoryService = inject(InventoryService);

  exchangingItem = signal<InventoryItem | null>(null);
  toastMessage = signal<string | null>(null);

  async ngOnInit() {
    // Nếu chưa có data (user vào thẳng tab Favorites, chưa từng ghé Inventory)
    if (!this.inventoryService.hasLoadedItems()) {
      await this.inventoryService.loadInventory();
    }
  }

  onCardClick(userInventoryId: string): void {
    this.inventoryService.toggleSelect(userInventoryId);
  }

  onToggleFavorite(event: Event, item: InventoryItem): void {
    event.stopPropagation();
    this.inventoryService.toggleFavorite(item.itemId);
  }

  onExchange(event: Event, item: InventoryItem): void {
    event.stopPropagation();
    this.exchangingItem.set(item);
  }

  onCloseExchangeModal(): void {
    this.exchangingItem.set(null);
  }

  onExchangeSuccess(result: { coinReceived: number; newBalance: number }): void {
    this.exchangingItem.set(null);
    this.toastMessage.set(`Đã nhận ${result.coinReceived} coin!`);
    setTimeout(() => this.toastMessage.set(null), 3000);
  }
}