// src/app/services/order-draft.service.ts
import { Injectable, signal } from '@angular/core';
import { InventoryItem } from './inventory.service';

@Injectable({ providedIn: 'root' })
export class OrderDraftService {
  selectedItems = signal<InventoryItem[]>([]);

  setDraft(items: InventoryItem[]): void {
    this.selectedItems.set(items);
  }

  clearDraft(): void {
    this.selectedItems.set([]);
  }

  hasDraft(): boolean {
    return this.selectedItems().length > 0;
  }
}