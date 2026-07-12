// src/app/services/inventory.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { supabase } from '../supabase.client'; // giống AuthService, import trực tiếp
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { OrderDraftService } from './order-draft.service';

export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Secret';
export type SortKey = 'newest' | 'rarity_desc' | 'rarity_asc' | 'qty_desc' | 'qty_asc';

const RARITY_ORDER: Record<Rarity, number> = {
  Common: 1,
  Rare: 2,
  Epic: 3,
  Legendary: 4,
  Secret: 5,
};

export interface InventoryItem {
  userInventoryId: string;
  itemId: string;
  name: string;
  image: string | null;
  rarity: Rarity;
  quantity: number;
  collectionId: string;
  collectionName: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private rawItems = signal<InventoryItem[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  selectedCount = computed(() => this.selectedIds().size);
  selectedRarity = signal<Rarity | 'All'>('All');
  sortKey = signal<SortKey>('newest');
  selectedIds = signal<Set<string>>(new Set());
  searchKeyword = signal<string>('');

  constructor(
  private authService: AuthService,
  private router: Router,
  private orderDraftService: OrderDraftService
) {}
  
  async loadInventory(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    const userId = this.authService.getCurrentUser()?.id;
    if (!userId) {
      this.error.set('Chưa đăng nhập');
      this.loading.set(false);
      return;
    }

    const { data, error } = await supabase
      .from('USER_INVENTORY')
      .select(`
        user_inventory_id,
        quantity,
        created_at,
        item_id,
        ITEM (
          item_id,
          name,
          image,
          rarity,
          collection_id,
          COLLECTION ( collection_id, name )
        )
      `)
      .eq('user_id', userId)
      .gt('quantity', 0);

    if (error) {
      this.error.set(error.message);
      this.loading.set(false);
      return;
    }

    const mapped: InventoryItem[] = (data ?? []).map((row: any) => ({
      userInventoryId: row.user_inventory_id,
      itemId: row.item_id,
      name: row.ITEM.name,
      image: row.ITEM.image,
      rarity: row.ITEM.rarity,
      quantity: row.quantity,
      collectionId: row.ITEM.collection_id,
      collectionName: row.ITEM.COLLECTION?.name ?? '',
      createdAt: row.created_at,
    }));

    this.rawItems.set(mapped);
    this.loading.set(false);
  }

  totalItems = computed(() =>
    this.rawItems().reduce((sum, i) => sum + i.quantity, 0)
  );

  totalCollections = computed(() => {
    const ids = new Set(this.rawItems().map(i => i.collectionId));
    return ids.size;
  });

  rarityCounts = computed(() => {
    const counts: Record<Rarity, number> = {
      Common: 0, Rare: 0, Epic: 0, Legendary: 0, Secret: 0,
    };
    for (const item of this.rawItems()) {
      counts[item.rarity] += item.quantity;
    }
    return counts;
  });

  displayItems = computed(() => {
  let items = this.rawItems();

  const rarity = this.selectedRarity();
  if (rarity !== 'All') {
    items = items.filter(i => i.rarity === rarity);
  }

  const keyword = this.searchKeyword().trim().toLowerCase();
  if (keyword) {
    items = items.filter(i => i.collectionName.toLowerCase().includes(keyword));
  }

  const sort = this.sortKey();
  items = [...items].sort((a, b) => {
    switch (sort) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'rarity_desc':
        return RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity];
      case 'rarity_asc':
        return RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity];
      case 'qty_desc':
        return b.quantity - a.quantity;
      case 'qty_asc':
        return a.quantity - b.quantity;
      default:
        return 0;
    }
  });

  return items;
});

// Thêm method set, để component gọi
setSearchKeyword(keyword: string): void {
  this.searchKeyword.set(keyword);
}

  toggleSelect(userInventoryId: string): void {
    const set = new Set(this.selectedIds());
    if (set.has(userInventoryId)) {
      set.delete(userInventoryId);
    } else {
      set.add(userInventoryId);
    }
    this.selectedIds.set(set);
  }

  isSelected(userInventoryId: string): boolean {
    return this.selectedIds().has(userInventoryId);
  }

  clearAll(): void {
    this.selectedIds.set(new Set());
  }

  getSelectedItems(): InventoryItem[] {
    const ids = this.selectedIds();
    return this.rawItems().filter(i => ids.has(i.userInventoryId));
  }

  shipSelected(): void {
  const items = this.getSelectedItems();
  if (items.length === 0) return;

  this.orderDraftService.setDraft(items);
  this.router.navigate(['/create-order']);
}

  getRarityBadgePath(rarity: Rarity): string {
    return `/Rarity/${rarity.toLowerCase()}.png`;
  }

  setRarityFilter(rarity: Rarity | 'All'): void {
    this.selectedRarity.set(rarity);
  }

  setSortKey(key: SortKey): void {
    this.sortKey.set(key);
  }

  // Thêm vào InventoryService

exchangeRates = signal<Record<Rarity, number>>({
  Common: 0, Rare: 0, Epic: 0, Legendary: 0, Secret: 0,
});

async loadExchangeRates(): Promise<void> {
  const { data, error } = await supabase
    .from('EXCHANGE_RATE')
    .select('rarity, coin_amount');

  if (error) {
    console.error('Load exchange rates failed:', error.message);
    return;
  }

  const rates: Record<Rarity, number> = {
    Common: 0, Rare: 0, Epic: 0, Legendary: 0, Secret: 0,
  };
  for (const row of data ?? []) {
    rates[row.rarity as Rarity] = row.coin_amount;
  }
  this.exchangeRates.set(rates);
}

async exchangeItem(itemId: string, quantity: number): Promise<{
  success: boolean;
  coinReceived?: number;
  newBalance?: number;
  error?: string;
}> {
  const { data, error } = await supabase.rpc('exchange_item', {
    p_item_id: itemId,
    p_quantity: quantity,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // exchange xong -> refresh lại inventory để cập nhật quantity mới
  await this.loadInventory();

  return {
    success: true,
    coinReceived: data.coin_received,
    newBalance: data.new_balance,
  };
}
}
