export interface AuditLog {
  log_id: string
  user_id: string
  tablename: string
  record_id: string
  action: 'INSERT' | 'UPDATE' | 'DELETE'
  oldvalue: string
  newvalue: string
  created_at: string
}