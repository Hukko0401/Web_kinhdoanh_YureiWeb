import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WalletService, TopupPackage } from '../../../../services/wallet.service';
import { AuthService } from '../../../../services/auth.service';

type PaymentMethod = 'momo' | 'zalopay' | 'vnpay';

@Component({
  selector: 'app-topup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topup.html',
  styleUrl: './topup.scss'
})
export class Topup implements OnInit {
  packages = signal<TopupPackage[]>([]);
  selectedPackageId = signal<string | null>(null);
  selectedMethod = signal<PaymentMethod | null>(null);
  savePayment = signal(false);
  submitting = signal(false);
  errorMsg = signal<string | null>(null);
  private currentUserId: string | null = null;

  methods: { id: PaymentMethod; label: string; icon: string }[] = [
    { id: 'momo', label: 'Momo', icon: '/Icons/momo.png' },
    { id: 'zalopay', label: 'ZaloPay', icon: '/Icons/zalopay.png' },
    { id: 'vnpay', label: 'VNPay', icon: '/Icons/vnpay.png' },
  ];

  private readonly styleMap: Record<string, { color: string; icon: string }> = {
    Starter: { color: '#839236', icon: '/Icons/coin.png' },
    Explorer: { color: '#567F9A', icon: '/Icons/Explorer.png' },
    Collector: { color: '#884C75', icon: '/Icons/Collector.png' },
    Master: { color: '#E7791E', icon: '/Icons/Master.png' },
    Legend: { color: '#D34D3F', icon: '/Icons/Legend.png' },
  };

  selectedPackage = computed(() =>
    this.packages().find(p => p.packageId === this.selectedPackageId()) ?? null
  );

  submitLabel = computed(() => {
    const pkg = this.selectedPackage();
    if (!pkg) return 'Top-up .... coin / .... đ';
    const totalCoin = pkg.coinAmount + pkg.bonusCoin;
    return `Top-up ${totalCoin} coin / ${pkg.price.toLocaleString('vi-VN')} đ`;
  });

  formatPrice(price: number): string {
  return price.toLocaleString('vi-VN');
}

  canSubmit = computed(() => !!this.selectedPackageId() && !!this.selectedMethod() && !this.submitting());

  constructor(
    private walletService: WalletService,
    private authService: AuthService   // thêm dòng này
  ) {}

   async ngOnInit(): Promise<void> {
    this.packages.set(await this.walletService.getTopupPackages());
    this.authService.currentUser$.subscribe(user => {
    this.currentUserId = user?.id ?? null;
    });
  }

  packageColor(name: string): string {
    return this.styleMap[name]?.color ?? '#839236';
  }

  packageIcon(name: string): string {
    return this.styleMap[name]?.icon ?? '/Icons/coin.png';
  }

  selectPackage(id: string): void {
    this.selectedPackageId.set(id);
  }

  selectMethod(method: PaymentMethod): void {
    this.selectedMethod.set(method);
  }

  toggleSavePayment(): void {
    this.savePayment.update(v => !v);
  }

  async submit(): Promise<void> {
    const pkg = this.selectedPackage();
    const method = this.selectedMethod();
    if (!pkg || !method) return;

    this.submitting.set(true);
    this.errorMsg.set(null);

    const mock = false; // cả 3 gateway đều đi luồng thật rồi

    const result = await this.walletService.createTopupTransaction(pkg.packageId, mock);

    if (!result) {
      this.errorMsg.set('Có lỗi xảy ra, thử lại nhé.');
      this.submitting.set(false);
      return;
    }

    if (mock) {
      if (this.currentUserId) {
        await this.walletService.refreshBalance(this.currentUserId);
      }
      alert('Top-up thành công!');
      window.location.href = '/wallet/balance';
      return;
    }

    const paymentUrl = await this.walletService.createTopupPaymentUrl(result.transactionId, method);
    if (!paymentUrl) {
      this.errorMsg.set('Không tạo được link thanh toán, thử lại nhé.');
      this.submitting.set(false);
      return;
    }

    window.location.href = paymentUrl;
  }
}