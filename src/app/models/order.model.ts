export interface Order {
order_id: string
user_id: string
status: 'processing' | 'shipping' | 'completed' | 'cancelled'
receiver_name: string
receiver_phone: string
address: string
shipping_fee: number
created_at: string
}