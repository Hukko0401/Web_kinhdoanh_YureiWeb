import { Injectable } from '@angular/core'
import { supabase } from '../supabase.client'

@Injectable({ providedIn: 'root' })
export class GachaService {

  // Roll x1
async rollOne(user_id: string, collection_id: string) {}

  // Roll x5
async rollFive(user_id: string, collection_id: string) {}

  // Lấy lịch sử roll
async getRollHistory(user_id: string) {}

}