import { Injectable, signal } from '@angular/core';

export type AlertMode = 'ok' | 'confirm';

@Injectable({ providedIn: 'root' })
export class AlertService {
  message = signal('');
  mode = signal<AlertMode>('ok');

  private resolveConfirm: ((result: boolean) => void) | null = null;

  // Popup chỉ có nút OK (dùng cho thông báo)
  show(message: string) {
    this.message.set(message);
    this.mode.set('ok');
  }

  // Popup có Yes/No, trả về Promise<boolean> để await kết quả
  confirm(message: string): Promise<boolean> {
    this.message.set(message);
    this.mode.set('confirm');

    return new Promise<boolean>((resolve) => {
      this.resolveConfirm = resolve;
    });
  }

  onYes() {
    this.resolveConfirm?.(true);
    this.close();
  }

  onNo() {
    this.resolveConfirm?.(false);
    this.close();
  }

  close() {
    this.message.set('');
    this.resolveConfirm = null;
  }
}