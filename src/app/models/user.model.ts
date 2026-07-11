export interface User {
  user_id: string
  email: string
  password: string
  phone_number: string
  username: string
  avatar: string
  status: 'active' | 'banned'
  role: 'admin' | 'customer'
  created_at: string
  date_of_birth?: string
  gender?: string
  notify_promotions?: boolean
  notify_expiry?: boolean
  notify_new_collections?: boolean
}

export interface Customer {
user_id: string
}

export interface Admin {
user_id: string
}

export type UserUpdatePayload = Partial<Pick<User,
  'username' | 'phone_number' | 'date_of_birth' | 'gender' | 'email' | 'avatar' |
  'notify_promotions' | 'notify_expiry' | 'notify_new_collections'
>>;