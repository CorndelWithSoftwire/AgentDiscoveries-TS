import { User } from './user'

declare module 'express-session' {
  interface SessionData {
    user: Omit<User, 'hashedPassword'>
  }
}
