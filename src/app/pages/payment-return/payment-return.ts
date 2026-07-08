// src/app/pages/payment-return/payment-return.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { supabase } from '../../supabase.client';

type ResultState = 'checking' | 'success' | 'failed' | 'not_found';

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

  async ngOnInit(): Promise<void> {
    const params = this.route.snapshot.queryParamMap;
    const txnRef = params.get('vnp_TxnRef'); // đây chính là transaction_id mình dùng làm vnp_TxnRef lúc build URL
    const responseCode = params.get('vnp_ResponseCode');

    if (!txnRef) {
      this.state.set('not_found');
      return;
    }

    // Poll DB vài lần để chờ IPN (server-to-server) kịp xử lý xong,
    // vì IPN và redirect return có thể tới không cùng lúc.
    const maxAttempts = 5;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const { data: txn } = await supabase
        .from('TRANSACTION')
        .select('status, reference_id')
        .eq('transaction_id', txnRef)
        .single();

      if (txn && txn.status !== 'pending') {
        this.orderId.set(txn.reference_id);
        this.state.set(txn.status === 'success' ? 'success' : 'failed');
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 1500)); // chờ 1.5s rồi thử lại
    }

    // Sau maxAttempts vẫn pending — fallback theo responseCode tạm thời,
    // báo user chờ, IPN có thể đến trễ (VNPAY vẫn retry ngầm)
    this.state.set(responseCode === '00' ? 'success' : 'failed');
  }

  goToInventory(): void {
    this.router.navigate(['/inventory']);
  }

  goToOrders(): void {
    // TODO: đổi route này nếu cậu có trang danh sách đơn hàng riêng
    this.router.navigate(['/inventory']);
  }
}