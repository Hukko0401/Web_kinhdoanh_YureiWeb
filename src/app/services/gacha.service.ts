import { Injectable } from '@angular/core'
import { supabase } from '../supabase.client'

export interface RollResultItem {
  rollHistoryId: string;
  itemName: string;
  imageUrl: string;
}

export interface RollHistoryRow {
  rollHistoryId: string;
  banner: string;
  itemName: string;
  rarity: string;
  timestamp: string;
}

export interface GachaError {
  code: string;
  message: string;
}

export interface GachaResult<T> {
  data: T | null;
  error: GachaError | null;
}

// Các mã lỗi cố định raise từ SQL function roll_gacha — so sánh tuyệt đối,
// không dùng .includes() vì message đã là enum string cố định, không phải câu tự do.
const KNOWN_ERROR_CODES = [
  'INVALID_ROLL_TYPE',
  'WALLET_NOT_FOUND',
  'INSUFFICIENT_COIN',
] as const;

function parseGachaError(error: { message: string }): GachaError {
  const matched = KNOWN_ERROR_CODES.find(code => error.message === code);
  if (matched) {
    return { code: matched, message: error.message };
  }
  // NO_ITEM_FOUND_FOR_RARITY có suffix động (": %"), nên check bằng startsWith
  if (error.message.startsWith('NO_ITEM_FOUND_FOR_RARITY')) {
    return { code: 'NO_ITEM_FOUND_FOR_RARITY', message: error.message };
  }
  return { code: 'UNKNOWN', message: error.message };
}

@Injectable({ providedIn: 'root' })
export class GachaService {

  async rollOne(user_id: string, collection_id: string): Promise<GachaResult<RollResultItem[]>> {
    return this.roll(user_id, collection_id, 'x1');
  }

  async rollFive(user_id: string, collection_id: string): Promise<GachaResult<RollResultItem[]>> {
    return this.roll(user_id, collection_id, 'x5');
  }

  private async roll(
    user_id: string,
    collection_id: string,
    type: 'x1' | 'x5'
  ): Promise<GachaResult<RollResultItem[]>> {
    const { data, error } = await supabase.rpc('roll_gacha', {
      p_user_id: user_id,
      p_collection_id: collection_id,
      p_type: type,
    })

    if (error) {
      return { data: null, error: parseGachaError(error) };
    }

    const mapped: RollResultItem[] = (data ?? []).map((row: any) => ({
      rollHistoryId: row.roll_history_id,
      itemName: row.item_name,
      imageUrl: row.image_url,
    }))

    return { data: mapped, error: null };
  }

  async getRollHistory(
    user_id: string,
    collection_id?: string,
    page = 1,
    limit = 5
  ): Promise<GachaResult<{ rows: RollHistoryRow[]; total: number }>> {
    const { data, error } = await supabase.rpc('get_roll_history', {
      p_user_id: user_id,
      p_collection_id: collection_id ?? null,
      p_page: page,
      p_limit: limit,
    })

    if (error) {
      return { data: null, error: parseGachaError(error) };
    }

    const rows: RollHistoryRow[] = (data ?? []).map((row: any) => ({
      rollHistoryId: row.roll_history_id,
      banner: row.banner_name,
      itemName: row.item_name,
      rarity: row.rarity,
      timestamp: new Date(row.created_at).toLocaleString('vi-VN'),
    }))

    // total_count lặp lại giống nhau ở mọi dòng (window function COUNT(*) OVER()),
    // lấy từ dòng đầu tiên; nếu không có dòng nào thì total = 0
    const total = (data && data.length > 0) ? Number(data[0].total_count) : 0;

    return { data: { rows, total }, error: null };
  }
}