export interface Transaction {
transaction_id: string
wallet_id: string
type: 'topup' | 'roll' | 'order' | 'exchange'
amount: number        // tiền hoặc coin tùy type
gateway_transaction_id?: string    // <- ? là nullable, chỉ có khi topup/order
payment_gateway?: 'vnpay' | 'momo' | 'zalopay'  // <- nullable, chỉ có khi topup/order
reference_id?: string   // <- nullable, ref tới top-up package/roll_session/order/exchange_log
time: string
status: 'pending' | 'success' | 'failed'
}