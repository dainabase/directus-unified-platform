// Base types
export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
  user_created?: string
  user_updated?: string
}

// Company types
export interface OwnerCompany extends BaseEntity {
  name: string
  code: string
  logo?: string
  primary_color?: string
  secondary_color?: string
  address?: string
  city?: string
  postal_code?: string
  country?: string
  email?: string
  phone?: string
  website?: string
  tax_number?: string
  registration_number?: string
}

// Project types
export interface Project extends BaseEntity {
  name: string
  description?: string
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
  start_date: string
  end_date: string
  budget: number
  spent: number
  progress: number
  owner_company: string
  client?: Client
  project_manager?: User
  deliverables?: Deliverable[]
  milestones?: Milestone[]
}

export interface Deliverable extends BaseEntity {
  name: string
  description?: string
  project_id: string
  status: 'todo' | 'in_progress' | 'done'
  due_date: string
  assigned_to?: string
}

export interface Milestone extends BaseEntity {
  name: string
  description?: string
  project_id: string
  date: string
  status: 'pending' | 'completed'
}

// Contact & Client types
export interface Contact extends BaseEntity {
  first_name: string
  last_name: string
  email?: string
  phone?: string
  mobile?: string
  position?: string
  company?: string
  owner_company: string
  avatar?: string
  notes?: string
}

export interface Client extends BaseEntity {
  name: string
  type: 'individual' | 'company'
  contact_id?: string
  owner_company: string
  industry?: string
  website?: string
  tax_number?: string
  credit_limit?: number
  payment_terms?: number
}

// User & Employee types
export interface User extends BaseEntity {
  email: string
  first_name: string
  last_name: string
  avatar?: string
  role?: Role
  status: 'active' | 'suspended' | 'archived'
  last_access?: string
}

export interface Employee extends BaseEntity {
  contact_id: string
  employee_number: string
  department?: string
  position?: string
  hire_date: string
  contract_type: 'permanent' | 'temporary' | 'contractor'
  salary?: number
  manager_id?: string
  owner_company: string
}

export interface Role {
  id: string
  name: string
  admin_access: boolean
  app_access: boolean
}

// Finance types
export interface Invoice extends BaseEntity {
  invoice_number: string
  type: 'client' | 'supplier'
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  date: string
  due_date: string
  client_id?: string
  supplier_id?: string
  owner_company: string
  subtotal: number
  tax_amount: number
  total: number
  currency: string
  items?: InvoiceItem[]
  payments?: Payment[]
}

export interface InvoiceItem {
  description: string
  quantity: number
  unit_price: number
  tax_rate: number
  total: number
}

export interface Payment extends BaseEntity {
  invoice_id: string
  amount: number
  date: string
  method: 'bank_transfer' | 'credit_card' | 'cash' | 'check' | 'other'
  reference?: string
  owner_company: string
}

export interface BankTransaction extends BaseEntity {
  bank_account_id: string
  date: string
  description: string
  amount: number
  type: 'debit' | 'credit'
  category?: string
  reconciled: boolean
  reference?: string
  owner_company: string
}

// Document types
export interface Document extends BaseEntity {
  name: string
  description?: string
  file_id: string
  type: string
  size: number
  owner_company: string
  related_to?: string
  related_type?: string
  tags?: string[]
}

// Dashboard types
export interface DashboardKPI {
  id: string
  name: string
  value: number
  previous_value?: number
  change_percentage?: number
  type: 'currency' | 'number' | 'percentage'
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
  owner_company: string
}

export interface Activity {
  id: string
  type: string
  title: string
  description: string
  timestamp: string
  user_id: string
  related_to?: string
  related_type?: string
}