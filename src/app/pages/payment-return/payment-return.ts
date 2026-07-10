import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { supabase } from '../../supabase.client';

type ResultState = 'checking' | 'success' | 'failed' | 'not_found';
type TxnType = 'order' | 'topup' | null;

@Component({
  selector: 'app-payment-return',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payment-return.html',
  styleUrl: './payment-return.scss',
})
export class PaymentReturn implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  state = signal<ResultState>('checking');
  orderId = signal<string | null>(null);
  txnType = signal<TxnType>(null);

  async ngOnInit(): Promise<void> {
  const params = this.route.snapshot.queryParamMap;
  const txnRef = params.get('vnp_TxnRef');
  const responseCode = params.get('vnp_ResponseCode');

  if (!txnRef) {
    this.state.set('not_found');
    return;
  }

  const maxAttempts = 5;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const { data: txn } = await supabase.functions.invoke('check-transaction-status', {
      body: { transactionId: txnRef },
    });

    if (txn && txn.status && txn.status !== 'pending') {
      this.orderId.set(txn.reference_id);
      this.txnType.set(txn.type as TxnType);

      const isFailed = txn.status !== 'success';
      this.state.set(isFailed ? 'failed' : 'success');

      if (isFailed && txn.type === 'order' && txn.reference_id) {
        await supabase.rpc('cancel_order', { p_order_id: txn.reference_id });
      }
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  // Hết 5 lần poll mà vẫn không xác định được -> coi theo responseCode, nhưng
  // lúc này chưa chắc biết orderId/type nếu check-transaction-status chưa từng trả về gì
  const fallbackFailed = responseCode !== '00';
  this.state.set(fallbackFailed ? 'failed' : 'success');
}

  goToInventory(): void {
    this.router.navigate(['/inventory']);
  }

  goToOrders(): void {
    this.router.navigate(['/inventory']);
  }

  goToWallet(): void {
    this.router.navigate(['/wallet/balance']);
  }
}