import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-shipping-policy',
  standalone: true,
  imports: [CommonModule, Header, Footer],
  templateUrl: './shipping-policy.html',
  styleUrls: ['./shipping-policy.scss']
})
export class ShippingPolicy {
  // Có thể thêm logic nếu cần, ví dụ tracking number, subscribe email...
}