import { Component, OnInit, inject,signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService, Rarity, SortKey,InventoryItem } from '../../services/inventory.service';
import { Header } from '../../components/header/header'; // chỉnh path đúng theo dự án
import { RouterModule } from '@angular/router'
import { ExchangeModal } from '../../components/exchange-modal/exchange-modal';
@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, Header,RouterModule, ExchangeModal],
  templateUrl: './inventory.html',
  styleUrl: './inventory.scss',
})
export class Inventory implements OnInit {
  inventoryService = inject(InventoryService);
  exchangingItem = signal<InventoryItem | null>(null);
  toastMessage = signal<string | null>(null);

  rarities: (Rarity | 'All')[] = ['All', 'Common', 'Rare', 'Epic', 'Legendary', 'Secret'];

  sortOptions: { value: SortKey; label: string }[] = [
    { value: 'newest', label: 'Newest' },
    { value: 'rarity_desc', label: 'Rarity-desc' },
    { value: 'rarity_asc', label: 'Rarity-asc' },
    { value: 'qty_desc', label: 'Quanity-desc' },
    { value: 'qty_asc', label: 'Quanity-asc' },
  ];

  isSortOpen = false;

 ngOnInit(): void {
    this.inventoryService.loadInventory();
    this.inventoryService.loadExchangeRates(); // thêm dòng này
  }

  selectRarity(rarity: Rarity | 'All'): void {
    this.inventoryService.setRarityFilter(rarity);
  }
  onSearchInput(event: Event): void {
  const value = (event.target as HTMLInputElement).value;
  this.inventoryService.setSearchKeyword(value);
}

  selectSort(key: SortKey): void {
    this.inventoryService.setSortKey(key);
    this.isSortOpen = false;
  }

  toggleSortDropdown(): void {
    this.isSortOpen = !this.isSortOpen;
  }

  currentSortLabel(): string {
    const key = this.inventoryService.sortKey();
    return this.sortOptions.find(o => o.value === key)?.label ?? 'Mới nhất';
  }

  onCardClick(userInventoryId: string): void {
    this.inventoryService.toggleSelect(userInventoryId);
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

  onClearAll(): void {
    this.inventoryService.clearAll();
  }

  onShipSelected(): void {
    this.inventoryService.shipSelected();
  }

  rarityCountFor(rarity: Rarity | 'All'): number {
    if (rarity === 'All') return this.inventoryService.totalItems();
    return this.inventoryService.rarityCounts()[rarity];
  }
}