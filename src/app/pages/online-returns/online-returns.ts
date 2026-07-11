import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-online-returns',
  standalone: true,
  imports: [CommonModule, Header, Footer],
  templateUrl: './online-returns.html',
  styleUrls: ['./online-returns.scss']
})
export class OnlineReturns {
}