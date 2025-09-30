export interface Customer {
  id: string
  user_id: string
  phone_number: string
  name?: string
  email?: string
  company?: string
  tags?: string[]
  status: "active" | "inactive" | "blocked"
  created_at: string
  updated_at: string
}

export interface Note {
  id: string
  user_id: string
  customer_id: string
  call_id?: string
  title: string
  content: string
  priority: "low" | "medium" | "high"
  tags?: string[]
  is_pinned: boolean
  created_at: string
  updated_at: string
  customer?: Customer
}

export interface FollowUp {
  id: string
  user_id: string
  customer_id: string
  note_id?: string
  title: string
  description?: string
  due_date: string
  status: "pending" | "completed" | "overdue"
  priority: "low" | "medium" | "high"
  created_at: string
  updated_at: string
  customer?: Customer
  note?: Note
}
