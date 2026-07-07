export interface DropRate {
  drop_rate_id: string
  drop_rate: number
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Secret'
  updated_at: string
}