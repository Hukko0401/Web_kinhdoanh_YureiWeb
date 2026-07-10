import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, Header, Footer],
  templateUrl: './news.html',
  styleUrl: './news.scss'
})
export class News {
  filters = ['All Stories', 'New Releases', 'Artist Features', 'Announcements', 'Events'];
  activeFilter = 'All Stories';

  setFilter(f: string): void {
    this.activeFilter = f;
  }
}