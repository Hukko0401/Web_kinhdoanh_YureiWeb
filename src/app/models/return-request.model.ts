export interface ReturnRequest {
  return_id: string
  order_id: string
  quantity: number
  reason: string
  images: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}