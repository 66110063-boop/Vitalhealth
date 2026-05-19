import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useHealthStore } from './store/useHealthStore'
import useSmartReminders from './hooks/useSmartReminders'
import AICoachChat from './components/AICoachChat'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import ExercisePage from './pages/ExercisePage'
import FoodPage from './pages/FoodPage'
import SleepPage from './pages/SleepPage'
import SettingsPage from './pages/SettingsPage'
import ProfilePage from './pages/ProfilePage'
import HealthTipsPage from './pages/HealthTipsPage'
import Header from './components/Header'
import Footer from './components/Footer'

export default function App() {
  const { user } = useAuth()
  const { isDarkMode, checkDailyReset, themeColor, syncWithCloud } = useHealthStore()
  
  // Initialize smart reminders globally
  useSmartReminders()

  // Sync health data with PostgreSQL cloud storage on mount/login
  useEffect(() => {
    if (user?.email) {
      syncWithCloud(user.email)
    }
  }, [user?.email, syncWithCloud])

  // Apply theme variables globally
  useEffect(() => {
    const roots = {
      '#16a97a': { deep: '#0d6e4f', mid: '#16a97a', pale: '#b8e8d6', bg: '#f0faf6' },
      '#0891b2': { deep: '#0e7490', mid: '#0891b2', pale: '#cffafe', bg: '#ecfeff' },
      '#8b5cf6': { deep: '#6d28d9', mid: '#8b5cf6', pale: '#ede9fe', bg: '#faf5ff' },
      '#f43f5e': { deep: '#be123c', mid: '#f43f5e', pale: '#ffe4e6', bg: '#fff1f2' },
      '#f59e0b': { deep: '#b45309', mid: '#f59e0b', pale: '#fef3c7', bg: '#fffbeb' },
    };
    
    const activeTheme = roots[themeColor] || roots['#16a97a'];
    
    if (isDarkMode) {
      document.documentElement.style.setProperty('--color-green-deep', activeTheme.mid);
      document.documentElement.style.setProperty('--color-green-mid', activeTheme.mid);
      document.documentElement.style.setProperty('--color-green-pale', activeTheme.deep);
      document.documentElement.style.setProperty('--color-bg-main', '#0f172a');
    } else {
      document.documentElement.style.setProperty('--color-green-deep', activeTheme.deep);
      document.documentElement.style.setProperty('--color-green-mid', activeTheme.mid);
      document.documentElement.style.setProperty('--color-green-pale', activeTheme.pale);
      document.documentElement.style.setProperty('--color-bg-main', activeTheme.bg);
    }
  }, [themeColor, isDarkMode])

  // Auto-reset daily stats when app opens on a new day
  useEffect(() => {
    checkDailyReset()
  }, [])

  // If not logged in → show login or register page
  if (!user) {
    return (
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<LoginPage onSuccess={() => {}} />} />
      </Routes>
    )
  }

  return (
    <div className={`flex flex-col min-h-screen ${isDarkMode ? 'dark' : ''} bg-app-bg text-app-text transition-colors duration-300`}>
      <Header />
      <main className="flex-1 max-w-[1100px] mx-auto w-full px-4 md:px-7 pb-20 lg:pb-0">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/exercise" element={<ExercisePage />} />
          <Route path="/food" element={<FoodPage />} />
          <Route path="/sleep" element={<SleepPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/tips" element={<HealthTipsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <AICoachChat />
    </div>
  )
}
