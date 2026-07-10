import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WalletService, WalletTransaction } from '../../../../services/wallet.service';
import { AuthService } from '../../../../services/auth.service';

type TypeFilter = 'all' | 'topup' | 'roll' | 'exchange' | 'order';

interface HistoryRow extends WalletTransaction {
  displayBalance: number;
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './history.html',
  styleUrl: './history.scss'
})
export class History implements OnInit {
  transactions = signal<WalletTransaction[]>([]);
  currentBalance = signal<number>(0);
  loading = signal(false);

  typeFilter = signal<TypeFilter>('all');
  dateFrom = signal<string>('');
  dateTo = signal<string>('');

  typeOptions: { value: TypeFilter; label: string }[] = [
    { value: 'all', label: 'All types' },
    { value: 'topup', label: 'Top-up' },
    { value: 'roll', label: 'Roll Gacha' },
    { value: 'exchange', label: 'Exchange Item' },
    { value: 'order', label: 'Pay Shipping Fee' },
  ];

  private readonly typeLabels: Record<string, string> = {
    topup: 'Top-up',
    roll: 'Roll Gacha',
    exchange: 'Exchange Item',
    order: 'Pay Shipping Fee',
  };

  // Duyệt từ mới -> cũ, lùi dần balance chỉ khi giao dịch success.
  rows = computed<HistoryRow[]>(() => {
  const sorted = [...this.transactions()].sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
  );

  let cursor = this.currentBalance();
  const result: HistoryRow[] = [];

  for (const tx of sorted) {
    result.push({ ...tx, displayBalance: cursor });

    // order = tiền thật (VNPay), không đụng ví -> không cho ảnh hưởng cursor
    if (tx.status === 'success' && tx.type !== 'order') {
      cursor = cursor - this.signedAmount(tx);
    }
  }

  return result;
});

  filteredRows = computed(() => {
    let rows = this.rows();

    const type = this.typeFilter();
    if (type !== 'all') {
      rows = rows.filter(r => r.type === type);
    }

    const from = this.dateFrom();
    if (from) {
      const fromDate = new Date(from);
      rows = rows.filter(r => new Date(r.time) >= fromDate);
    }

    const to = this.dateTo();
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      rows = rows.filter(r => new Date(r.time) <= toDate);
    }

    return rows;
  });

  constructor(
    private walletService: WalletService,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
  this.loading.set(true);

  const userId = this.authService.getCurrentUser()?.id;
  if (!userId) {
    this.loading.set(false);
    return;
  }

  const [balanceResult, transactions] = await Promise.all([
    this.walletService.getBalance(userId),
    this.walletService.getTransactions(userId),
  ]);

  this.currentBalance.set(balanceResult.data);
  this.transactions.set(transactions);
  this.loading.set(false);
}

  typeLabel(type: string): string {
    return this.typeLabels[type] ?? type;
  }

  signedAmount(tx: WalletTransaction): number {
  const abs = Math.abs(tx.amount);
  if (tx.type === 'topup' || tx.type === 'exchange') return abs;
  return -abs;
}

 changeLabel(tx: WalletTransaction): string {
  const abs = Math.abs(tx.amount);
  if (tx.type === 'topup' || tx.type === 'exchange') return `+ ${abs}`;
  return `- ${abs}`;
}
  formatDate(time: string): string {
    const d = new Date(time);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}\n${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  setTypeFilter(value: TypeFilter): void {
    this.typeFilter.set(value);
  }
}