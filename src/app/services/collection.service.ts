import { Injectable } from '@angular/core'
import { supabase } from '../supabase.client'

@Injectable({ providedIn: 'root' })
export class CollectionService {

  // Lấy tất cả collection đang active
async getCollections() {}

  // Lấy chi tiết 1 collection + items
async getCollectionById(collection_id: string) {}

  // Lấy drop rate
async getDropRate() {}

}