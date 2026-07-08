// src/app/components/add-address-modal/add-address-modal.ts
import { Component, Output, EventEmitter, Input, signal, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShippingAddressService, ShippingAddress } from '../../services/shipping-address.service';

@Component({
  selector: 'app-add-address-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-address-modal.html',
  styleUrl: './add-address-modal.scss',
})
export class AddAddressModal implements OnInit, OnChanges {
  @Input() editingAddress: ShippingAddress | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() added = new EventEmitter<void>();

  label = signal('');
  recipientName = signal('');
  phoneNumber = signal('');
  address = signal('');
  isDefault = signal(false);

  submitting = signal(false);
  error = signal<string | null>(null);

  constructor(private shippingAddressService: ShippingAddressService) {}

  ngOnInit(): void {
    this.prefillIfEditing();
  }

  ngOnChanges(): void {
    this.prefillIfEditing();
  }

  private prefillIfEditing(): void {
    const addr = this.editingAddress;
    if (addr) {
      this.label.set(addr.label ?? '');
      this.recipientName.set(addr.recipientName ?? '');
      this.phoneNumber.set(addr.phoneNumber ?? '');
      this.address.set(addr.address ?? '');
      this.isDefault.set(addr.isDefault ?? false);
    }
  }

  get isEditMode(): boolean {
    return !!this.editingAddress;
  }

  onBackdropClick(): void {
    this.close.emit();
  }

  async save(): Promise<void> {
    if (!this.recipientName().trim() || !this.phoneNumber().trim() || !this.address().trim()) {
      this.error.set('Vui lòng điền đầy đủ thông tin');
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    const payload = {
      label: this.label().trim() || 'Address',
      recipientName: this.recipientName().trim(),
      phoneNumber: this.phoneNumber().trim(),
      address: this.address().trim(),
      isDefault: this.isDefault(),
    };

    const result = this.isEditMode
      ? await this.shippingAddressService.updateAddress(this.editingAddress!.addressId, payload)
      : await this.shippingAddressService.addAddress(payload);

    this.submitting.set(false);

    if (!result.success) {
      this.error.set(result.error ?? 'Có lỗi xảy ra, thử lại sau');
      return;
    }

    this.added.emit();
  }
}