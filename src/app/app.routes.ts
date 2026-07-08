import { Routes } from '@angular/router'
import { Home } from './pages/home/home'
import { authGuard } from './guards/auth.guard'

export const routes: Routes = [
  { path: '', component: Home },
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
]