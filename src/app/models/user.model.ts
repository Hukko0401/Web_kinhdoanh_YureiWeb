export interface User {
user_id: string        // uuid → string trong TypeScript
email: string
password: string
phone_number: string
username: string
avatar: string         // url → string
status: 'active' | 'banned'   // enum
role: 'admin' | 'customer'    // enum
created_at: string     // timestamp → Date
}

export interface Customer {
user_id: string
}

export interface Admin {
user_id: string
}