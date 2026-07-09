import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WalletService, WalletTransaction } from '../../../../services/wallet.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-balance',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './balance.html',
  styleUrl: './balance.scss'
})
export class Balance implements OnInit {
  balance = signal<number>(0);
  transactions = signal<WalletTransaction[]>([]);
  loading = signal(false);

  quickInfo = computed(() => {
    const txs = this.transactions();
    let totalTopup = 0;
    let totalSpent = 0;

    for (const tx of txs) {
      if (tx.status !== 'success') continue;
      if (tx.type === 'topup') totalTopup += tx.amount;
      if (tx.type === 'roll') totalSpent += tx.amount;
    }

    return { totalTopup, totalSpent, transactionCount: txs.length };
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

    this.balance.set(balanceResult.data);
    this.transactions.set(transactions);
    this.loading.set(false);
  }
}