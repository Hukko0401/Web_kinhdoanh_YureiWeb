export interface Item {
item_id: string
collection_id: string
name: string
image: string
rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Secret'
}