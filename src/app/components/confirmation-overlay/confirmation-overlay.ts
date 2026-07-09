import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirmation-overlay',
  standalone: true,
  templateUrl: './confirmation-overlay.html',
  styleUrl: './confirmation-overlay.scss'
})
export class ConfirmationOverlay {
  title = input.required<string>();
  message = input.required<string>();
  confirmText = input<string>('OK!');
  cancelText = input<string>('CANCEL');

  confirm = output<void>();
  cancel = output<void>();

  onBackdropClick(event: MouseEvent) {
    // chỉ đóng khi click đúng vào backdrop, không phải bên trong card
    if (event.target === event.currentTarget) {
      this.cancel.emit();
    }
  }
}