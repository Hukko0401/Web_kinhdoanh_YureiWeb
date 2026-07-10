import { Routes } from '@angular/router'
import { Home } from './pages/home/home'
import { authGuard } from './guards/auth.guard'

export const routes: Routes = [
  { path: '', component: Home },

  { path: 'gacha', loadComponent: () => import('./pages/gacha/gacha').then(m => m.Gacha) },

  { path: 'collections/:id', loadComponent: () => import('./pages/collection/collection').then(m => m.Collection) },
  { path: 'inventory', loadComponent: () => import('./pages/inventory/inventory').then(m => m.Inventory), canActivate: [authGuard] },
  { path: 'order-history', loadComponent: () => import('./pages/order-history/order-history').then(m => m.OrderHistory), canActivate: [authGuard] },
  { path: 'register', loadComponent: () => import('./pages/register/register').then(m => m.Register) },
  { path: 'auth-callback', loadComponent: () => import('./pages/auth-callback/auth-callback').then(m => m.AuthCallback) },
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  { path: 'forgot-password', loadComponent: () => import('./pages/forgot-password/forgot-password').then(m => m.ForgotPassword) },
  { path: 'reset-password', loadComponent: () => import('./pages/reset-password/reset-password').then(m => m.ResetPassword) },
  { path: 'create-order', loadComponent: () => import('./pages/create-order/create-order').then(m => m.CreateOrder), canActivate: [authGuard] },
  {
    path: 'payment-return',
    loadComponent: () => import('./pages/payment-return/payment-return').then(m => m.PaymentReturn),
  },
  {
    path: 'wallet',
    loadComponent: () => import('./pages/wallet/wallet/wallet').then(m => m.Wallet),
    children: [
      { path: '', redirectTo: 'balance', pathMatch: 'full' },
      { path: 'balance', loadComponent: () => import('./pages/wallet/balance/balance/balance').then(m => m.Balance) },
      { path: 'topup', loadComponent: () => import('./pages/wallet/topup/topup/topup').then(m => m.Topup) },
      { path: 'history', loadComponent: () => import('./pages/wallet/history/history/history').then(m => m.History) },
    ]
  },
  { path: 'how-to-roll', loadComponent: () => import('./pages/how-to-roll/how-to-roll').then(m => m.HowToRoll) },
  { path: 'complete-profile', loadComponent: () => import('./pages/complete-profile/complete-profile').then(m => m.CompleteProfile) },

  { path: 'news', loadComponent: () => import('./pages/news/news').then(m => m.News) },
  {
    path: 'shipping',
    loadComponent: () => import('./pages/shipping-policy/shipping-policy').then(m => m.ShippingPolicy)
  }


]