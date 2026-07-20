export interface Order {
  order_id: string
  user_id: string
  status: 'pending_payment' | 'payment_failed' | 'processing' | 'shipping' | 'completed' | 'cancelled'
  receiver_name: string
  receiver_phone: string
  address: string
  shipping_fee: number
  created_at: string
}