// src/app/services/shipping-address.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { supabase } from '../supabase.client';
import { AuthService } from './auth.service';

export interface ShippingAddress {
  addressId: string;
  label: string | null;
  recipientName: string;
  phoneNumber: string;
  address: string;
  isDefault: boolean;
  latitude: number | null;
  longitude: number | null;
}

// Toạ độ giả định "kho hàng" Yurei — đổi lại nếu cậu có địa chỉ cụ thể trong lore
const WAREHOUSE_LAT = 10.7769;
const WAREHOUSE_LNG = 106.7009;

// Bậc thang phí ship theo khoảng cách (km)
const SHIPPING_TIERS = [
  { maxKm: 5, fee: 20000 },
  { maxKm: 15, fee: 35000 },
  { maxKm: 30, fee: 50000 },
  { maxKm: Infinity, fee: 70000 },
];

@Injectable({ providedIn: 'root' })
export class ShippingAddressService {
  addresses = signal<ShippingAddress[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  defaultAddress = computed(() =>
    this.addresses().find(a => a.isDefault) ?? this.addresses()[0] ?? null
  );

  constructor(private authService: AuthService) {}

  async loadAddresses(): Promise<void> {
    this.loading.set(true);
    const userId = this.authService.getCurrentUser()?.id;
    if (!userId) {
      this.error.set('Chưa đăng nhập');
      this.loading.set(false);
      return;
    }

    const { data, error } = await supabase
      .from('SHIPPING_ADDRESS')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });

    if (error) {
      this.error.set(error.message);
      this.loading.set(false);
      return;
    }

    this.addresses.set((data ?? []).map(row => ({
      addressId: row.address_id,
      label: row.label,
      recipientName: row.recipient_name,
      phoneNumber: row.phone_number,
      address: row.address,
      isDefault: row.is_default,
      latitude: row.latitude,
      longitude: row.longitude,
    })));
    this.loading.set(false);
  }

  // Geocode địa chỉ text -> lat/lng qua Nominatim (miễn phí, không cần key)
  async geocodeAddress(addressText: string): Promise<{ lat: number; lng: number } | null> {
    const query = encodeURIComponent(`${addressText}, Vietnam`);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

    try {
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'vi' }, // ưu tiên kết quả tiếng Việt
      });
      const data = await res.json();
      if (!data || data.length === 0) return null;

      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    } catch {
      return null;
    }
  }

  // Công thức Haversine — tính khoảng cách đường chim bay giữa 2 toạ độ (km)
  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // bán kính Trái Đất (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  calculateShippingFee(address: ShippingAddress): number {
    if (address.latitude == null || address.longitude == null) {
      return SHIPPING_TIERS[SHIPPING_TIERS.length - 1].fee; // fallback nếu chưa geocode được
    }

    const distanceKm = this.haversineDistance(
      WAREHOUSE_LAT, WAREHOUSE_LNG,
      address.latitude, address.longitude
    );

    const tier = SHIPPING_TIERS.find(t => distanceKm <= t.maxKm)!;
    return tier.fee;
  }

  async addAddress(input: {
    label: string;
    recipientName: string;
    phoneNumber: string;
    address: string;
    isDefault: boolean;
  }): Promise<{ success: boolean; error?: string }> {
    const userId = this.authService.getCurrentUser()?.id;
    if (!userId) return { success: false, error: 'Chưa đăng nhập' };

    // Geocode trước khi lưu
    const coords = await this.geocodeAddress(input.address);

    // Nếu set làm default, bỏ default của các địa chỉ khác trước
    if (input.isDefault) {
      await supabase
        .from('SHIPPING_ADDRESS')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const { error } = await supabase.from('SHIPPING_ADDRESS').insert({
      user_id: userId,
      label: input.label,
      recipient_name: input.recipientName,
      phone_number: input.phoneNumber,
      address: input.address,
      is_default: input.isDefault,
      latitude: coords?.lat ?? null,
      longitude: coords?.lng ?? null,
    });

    if (error) return { success: false, error: error.message };

    await this.loadAddresses();
    return { success: true };
  }

  async deleteAddress(addressId: string): Promise<void> {
    await supabase.from('SHIPPING_ADDRESS').delete().eq('address_id', addressId);
    await this.loadAddresses();
  }

  async setDefault(addressId: string): Promise<void> {
    const userId = this.authService.getCurrentUser()?.id;
    if (!userId) return;

    await supabase.from('SHIPPING_ADDRESS').update({ is_default: false }).eq('user_id', userId);
    await supabase.from('SHIPPING_ADDRESS').update({ is_default: true }).eq('address_id', addressId);
    await this.loadAddresses();
  }

  async updateAddress(addressId: string, input: {
  label: string;
  recipientName: string;
  phoneNumber: string;
  address: string;
  isDefault: boolean;
}): Promise<{ success: boolean; error?: string }> {
  const userId = this.authService.getCurrentUser()?.id;
  if (!userId) return { success: false, error: 'Chưa đăng nhập' };

  // Chỉ re-geocode nếu địa chỉ text thay đổi so với bản đang lưu
  const current = this.addresses().find(a => a.addressId === addressId);
  let coords: { lat: number; lng: number } | null = null;

  if (current && current.address === input.address) {
    coords = current.latitude != null && current.longitude != null
      ? { lat: current.latitude, lng: current.longitude }
      : null;
  } else {
    coords = await this.geocodeAddress(input.address);
  }

  // Nếu set làm default, bỏ default của các địa chỉ khác trước (trừ chính nó)
  if (input.isDefault) {
    await supabase
      .from('SHIPPING_ADDRESS')
      .update({ is_default: false })
      .eq('user_id', userId)
      .neq('address_id', addressId);
  }

  const { error } = await supabase
    .from('SHIPPING_ADDRESS')
    .update({
      label: input.label,
      recipient_name: input.recipientName,
      phone_number: input.phoneNumber,
      address: input.address,
      is_default: input.isDefault,
      latitude: coords?.lat ?? null,
      longitude: coords?.lng ?? null,
    })
    .eq('address_id', addressId);

  if (error) return { success: false, error: error.message };

  await this.loadAddresses();
  return { success: true };
}
}