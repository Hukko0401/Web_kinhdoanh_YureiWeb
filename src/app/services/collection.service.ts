import { Injectable } from '@angular/core'
import { supabase } from '../supabase.client'
import { Collection } from '../models/collection.model'
import { Item } from '../models/item.model'

export interface DropRate {
  drop_rate_id: string
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Secret'
  drop_rate: number
  updated_at: string
}

export interface CollectionDetail extends Collection {
  items: Item[]
}

export interface ActiveCollection {
  id: string;
  name: string;
  videoUrl: string | null;
}

@Injectable({ providedIn: 'root' })
export class CollectionService {

  async getCollections(): Promise<{ data: ActiveCollection[]; error: string | null }> {
    const { data, error } = await supabase.rpc('get_active_collections')

    if (error) {
      return { data: [], error: error.message }
    }

    const mapped: ActiveCollection[] = (data ?? []).map((row: any) => ({
      id: row.collection_id,
      name: row.name,
      videoUrl: row.video,
    }))

    return { data: mapped, error: null }
  }

  // Lấy chi tiết 1 collection + items
  async getCollectionById(collection_id: string): Promise<CollectionDetail | null> {
    const { data: collection, error: collectionError } = await supabase
      .from('COLLECTION')
      .select('*')
      .eq('collection_id', collection_id)
      .single()

    if (collectionError || !collection) {
      console.error('getCollectionById error:', collectionError)
      return null
    }

    const { data: items, error: itemsError } = await supabase
      .from('ITEM')
      .select('*')
      .eq('collection_id', collection_id)

    if (itemsError) {
      console.error('getCollectionById items error:', itemsError)
      throw itemsError
    }

    return {
      ...collection,
      items: items ?? []
    }
  }

  // Lấy drop rate
  async getDropRate(): Promise<DropRate[]> {
    const { data, error } = await supabase
      .from('DROP_RATE')
      .select('*')

    if (error) {
      console.error('getDropRate error:', error)
      throw error
    }
    return data ?? []
  }
}