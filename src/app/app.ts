import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AlertPopup } from './components/alert-popup/alert-popup';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AlertPopup],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('yurei-web');
}
