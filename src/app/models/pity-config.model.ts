export interface PityConfig {
pity_config_id: string
rarity: 'Rare' | 'Epic' | 'Legendary'
threshold: number      // ← vd: Rare=5, Epic=15, Legendary=35
is_active: boolean
updated_at: string
}
