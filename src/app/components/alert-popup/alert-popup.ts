import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-alert-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert-popup.html',
  styleUrl: './alert-popup.scss'
})
export class AlertPopup {
  constructor(public alert: AlertService) {}

  onOk() {
    this.alert.close();
  }

  onYes() {
    this.alert.onYes();
  }

  onNo() {
    this.alert.onNo();
  }
}