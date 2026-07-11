import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShippingAddressService, ShippingAddress } from '../../../services/shipping-address.service';
import { AlertService } from '../../../services/alert.service';
import { AddAddressModal } from '../../../components/add-address-modal/add-address-modal';
import { AppendToBodyDirective } from '../../../shared/append-to-body.directive';

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [CommonModule, AddAddressModal, AppendToBodyDirective],
  templateUrl: './addresses.html',
  styleUrl: './addresses.scss'
})
export class Addresses implements OnInit {
  // Khai báo kiểu trước, KHÔNG gán giá trị ở đây
  addresses;
  loading;

  deletingId = signal<string | null>(null);
  showModal = signal(false);
  editingAddress = signal<ShippingAddress | null>(null);

  constructor(
    public shippingAddressService: ShippingAddressService,
    private alert: AlertService
  ) {
    // Gán TRONG constructor, sau khi shippingAddressService đã có giá trị
    this.addresses = this.shippingAddressService.addresses;
    this.loading = this.shippingAddressService.loading;
  }

  async ngOnInit() {
    await this.shippingAddressService.loadAddresses();
  }

  onAddNew() {
    this.editingAddress.set(null);
    this.showModal.set(true);
  }

  onEdit(address: ShippingAddress) {
    this.editingAddress.set(address);
    this.showModal.set(true);
  }

  onModalClose() {
    this.showModal.set(false);
    this.editingAddress.set(null);
  }

  onModalAdded() {
    const wasEditing = !!this.editingAddress();
    this.showModal.set(false);
    this.editingAddress.set(null);
    this.alert.show(wasEditing ? 'Update successful.' : 'Address added successfully.');
  }

  async onDelete(address: ShippingAddress) {
    const confirmed = await this.alert.confirm(`Xóa địa chỉ "${address.label}"?`);
    if (!confirmed) return;

    this.deletingId.set(address.addressId);
    try {
      await this.shippingAddressService.deleteAddress(address.addressId);
      this.alert.show('Delete successful.');
    } catch (err: any) {
      this.alert.show('Xóa địa chỉ thất bại.');
    } finally {
      this.deletingId.set(null);
    }
  }

  async onSetDefault(address: ShippingAddress) {
    if (address.isDefault) return;

    try {
      await this.shippingAddressService.setDefault(address.addressId);
    } catch (err: any) {
      this.alert.show('Cập nhật thất bại.');
    }
  }
}