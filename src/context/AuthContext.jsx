import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // โหลดข้อมูลผู้ใช้จาก localStorage ถ้ามี
    const savedUser = localStorage.getItem('vitalhealth_user')
    return savedUser ? JSON.parse(savedUser) : null
  })

  // บันทึกข้อมูลลง localStorage เมื่อมีการเปลี่ยนสถานะ
  useEffect(() => {
    if (user) {
      localStorage.setItem('vitalhealth_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('vitalhealth_user')
    }
  }, [user])

  const login = (usernameOrEmail, password) => {
    // 1. Check in registered users list
    const registeredUsers = JSON.parse(localStorage.getItem('vitalhealth_users') || '[]')
    const foundUser = registeredUsers.find(
      u => u.email.toLowerCase() === usernameOrEmail.toLowerCase() || 
           u.username?.toLowerCase() === usernameOrEmail.toLowerCase()
    )

    if (foundUser && foundUser.password === password) {
      setUser({
        username: foundUser.username || foundUser.email.split('@')[0],
        email: foundUser.email,
        name: foundUser.name,
        bio: foundUser.bio || 'รักการออกกำลังกายและดูแลสุขภาพ'
      })
      return true
    }

    // 2. Fallback to default developer mock login
    if (
      (usernameOrEmail === 'user' && password === '1234') ||
      (usernameOrEmail.includes('@') && password === '1234')
    ) {
      const displayName = usernameOrEmail.includes('@') ? usernameOrEmail.split('@')[0] : usernameOrEmail
      setUser({ username: displayName, email: usernameOrEmail, name: 'คุณผู้ใช้' })
      return true
    }
    return false
  }

  const register = (name, email, password) => {
    const registeredUsers = JSON.parse(localStorage.getItem('vitalhealth_users') || '[]')
    
    // Check if email already registered
    const exists = registeredUsers.some(u => u.email.toLowerCase() === email.toLowerCase())
    if (exists) {
      return { success: false, message: 'อีเมลนี้ถูกใช้งานแล้วในระบบ' }
    }

    const newUser = {
      username: email.split('@')[0],
      email: email,
      name: name,
      password: password,
      bio: 'รักการออกกำลังกายและดูแลสุขภาพ'
    }

    registeredUsers.push(newUser)
    localStorage.setItem('vitalhealth_users', JSON.stringify(registeredUsers))

    // Auto-login
    setUser({
      username: newUser.username,
      email: newUser.email,
      name: newUser.name,
      bio: newUser.bio
    })

    return { success: true }
  }

  const loginWithGoogle = (userData, accessToken) => {
    if (userData) {
      setUser({ 
        username: userData.name || 'google_user', 
        email: userData.email, 
        name: userData.name,
        avatar: userData.picture,
        accessToken: accessToken // Store the access token for Google API calls
      })
    }
    return true
  }

  const logout = () => setUser(null)

  const updateUser = (updates) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates }
      
      // Also update in registered users in localStorage if applicable
      const registeredUsers = JSON.parse(localStorage.getItem('vitalhealth_users') || '[]')
      const userIndex = registeredUsers.findIndex(u => u.email.toLowerCase() === prev.email.toLowerCase())
      if (userIndex !== -1) {
        registeredUsers[userIndex] = { ...registeredUsers[userIndex], ...updates }
        localStorage.setItem('vitalhealth_users', JSON.stringify(registeredUsers))
      }
      
      return updated
    })
  }

  return (
    <AuthContext.Provider value={{ user, login, register, loginWithGoogle, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
