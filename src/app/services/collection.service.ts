import { Injectable } from '@angular/core'
import { supabase } from '../supabase.client'

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

  async getCollectionById(collection_id: string) {}
  async getDropRate() {}
}