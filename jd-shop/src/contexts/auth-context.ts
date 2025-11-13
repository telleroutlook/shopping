import { createContext } from 'react'
import type { User } from '@supabase/supabase-js'
import type { UserRole } from '@/lib/supabase'

export interface AuthContextType {
  user: User | null
  userRole: UserRole | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshUserRole: () => Promise<void>
  setUserRoleManually: (roleData: UserRole | null) => void
  setManualLoginMode: (mode: boolean) => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
