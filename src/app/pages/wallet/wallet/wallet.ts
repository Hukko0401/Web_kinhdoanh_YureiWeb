import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { Header } from '../../../components/header/header';

type WalletTab = 'balance' | 'topup' | 'history';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [RouterOutlet, RouterLink,Header],
  templateUrl: './wallet.html',
  styleUrl: './wallet.scss'
})
export class Wallet implements OnInit, OnDestroy {
  activeTab: WalletTab = 'balance';
  private routerSub?: Subscription;

  private readonly bgMap: Record<WalletTab, string> = {
    balance: '/Bg/Wallet_Bg_Balance.png',
    topup: '/Bg/Wallet_Bg_Topup.png',
    history: '/Bg/Wallet_Bg_History.png'
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateActiveTab(this.router.url);
    this.routerSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateActiveTab(event.urlAfterRedirects);
      }
    });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  get bgImage(): string {
    return this.bgMap[this.activeTab];
  }

  private updateActiveTab(url: string): void {
    if (url.includes('/wallet/topup')) this.activeTab = 'topup';
    else if (url.includes('/wallet/history')) this.activeTab = 'history';
    else this.activeTab = 'balance';
  }
}