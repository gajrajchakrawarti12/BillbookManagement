import type { User } from "./User"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string, role: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  checkValidUsername: (username: string) => Promise<boolean>
}

export type { AuthContextType, User }