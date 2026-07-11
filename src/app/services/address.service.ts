import { Injectable } from '@angular/core'
import { supabase } from '../supabase.client'

export interface ShippingAddress {
  address_id: string;
  user_id: string;
  label: string;
  recipient_name: string;
  phone_number: string;
  address: string;
  is_default: boolean;
  latitude?: number;
  longitude?: number;
}

export type AddressPayload = Partial<Pick<ShippingAddress, 'label' | 'recipient_name' | 'phone_number' | 'address' | 'is_default' | 'latitude' | 'longitude'>>;

const ADDRESS_COLUMNS = 'address_id, user_id, label, recipient_name, phone_number, address, is_default, latitude, longitude';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private cachedAddresses: ShippingAddress[] | null = null;

  // Lấy danh sách địa chỉ
  async getAddresses(user_id: string): Promise<ShippingAddress[]> {
    const { data, error } = await supabase
      .from('SHIPPING_ADDRESS')
      .select(ADDRESS_COLUMNS)
      .eq('user_id', user_id)
      .order('is_default', { ascending: false });

    if (error) {
      throw new Error('Không thể tải danh sách địa chỉ.');
    }

    this.cachedAddresses = (data as unknown as ShippingAddress[]) ?? [];
    return this.cachedAddresses;
  }

  getCachedAddresses(): ShippingAddress[] | null {
    return this.cachedAddresses;
  }

  // Thêm địa chỉ mới
  async addAddress(user_id: string, address: AddressPayload): Promise<ShippingAddress> {
    const { data, error } = await supabase
      .from('SHIPPING_ADDRESS')
      .insert({ ...address, user_id })
      .select(ADDRESS_COLUMNS)
      .single();

    if (error || !data) {
      throw new Error('Thêm địa chỉ thất bại.');
    }

    return data as unknown as ShippingAddress;
  }

  // Cập nhật địa chỉ
  async updateAddress(address_id: string, address: AddressPayload): Promise<ShippingAddress> {
    const { data, error } = await supabase
      .from('SHIPPING_ADDRESS')
      .update(address)
      .eq('address_id', address_id)
      .select(ADDRESS_COLUMNS)
      .single();

    if (error || !data) {
      throw new Error('Cập nhật địa chỉ thất bại.');
    }

    return data as unknown as ShippingAddress;
  }

  // Xoá địa chỉ
  async deleteAddress(address_id: string): Promise<void> {
    const { error } = await supabase
      .from('SHIPPING_ADDRESS')
      .delete()
      .eq('address_id', address_id);

    if (error) {
      throw new Error('Xóa địa chỉ thất bại.');
    }
  }

  // Set địa chỉ mặc định
  async setDefault(address_id: string, user_id: string): Promise<void> {
    // Bỏ default ở tất cả địa chỉ khác của user này
    const { error: clearError } = await supabase
      .from('SHIPPING_ADDRESS')
      .update({ is_default: false })
      .eq('user_id', user_id);

    if (clearError) {
      throw new Error('Cập nhật địa chỉ mặc định thất bại.');
    }

    // Set default cho địa chỉ được chọn
    const { error: setError } = await supabase
      .from('SHIPPING_ADDRESS')
      .update({ is_default: true })
      .eq('address_id', address_id);

    if (setError) {
      throw new Error('Cập nhật địa chỉ mặc định thất bại.');
    }
  }
}