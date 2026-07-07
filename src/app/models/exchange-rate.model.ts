export interface ExchangeRate {
  exchange_rate_id: string
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Secret'
  coin_amount: number
  created_at: string
}