import { useEffect, useRef } from 'react'
import { useHealthStore } from '../store/useHealthStore'
import { useAuth } from '../context/AuthContext'
import emailjs from '@emailjs/browser'

// Helper to send real browser notification
const triggerNotification = (title, message) => {
  if (!("Notification" in window)) return

  if (Notification.permission === "granted") {
    new Notification(title, {
      body: message,
      icon: '/favicon.ico'
    })
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification(title, {
          body: message,
          icon: '/favicon.ico'
        })
      }
    })
  }
}

// Helper to send real email via EmailJS
const triggerEmail = (title, message, toEmail) => {
  if (!toEmail) return

  const serviceId = 'service_aynhhx1'
  const templateId = 'template_do68sxq'
  const publicKey = 'FFIEE2lEwXhsN7ibV'

  const templateParams = {
    title: title,
    to_email: toEmail,
    name: 'ระบบแจ้งเตือน VitalHealth',
    message: message
  }

  emailjs.send(serviceId, templateId, templateParams, publicKey)
    .then((response) => {
      console.log('EMAIL SENT SUCCESS!', response.status, response.text)
    }, (err) => {
      console.error('EMAIL SEND FAILED...', err)
    })
}

export default function useSmartReminders() {
  const { user } = useAuth()
  const notificationSettings = useHealthStore(state => state.notificationSettings)
  const lastNotified = useRef({})

  useEffect(() => {
    // Helper to send both notifications if active
    const handleReminder = (title, message) => {
      triggerNotification(title, message)
      if (notificationSettings?.emailAlert?.active && user?.email && user.email.includes('@')) {
        triggerEmail(title, message, user.email)
      }
    }

    // Check every minute
    const intervalId = setInterval(() => {
      const now = new Date()
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()
      const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`

      if (!notificationSettings) return

      // Exercise
      if (notificationSettings.exercise?.active && notificationSettings.exercise.time === currentTimeStr) {
        if (lastNotified.current.exercise !== currentTimeStr) {
          handleReminder('ได้เวลาออกกำลังกายแล้ว!', 'ขยับร่างกายวันละนิดจิตแจ่มใส')
          lastNotified.current.exercise = currentTimeStr
        }
      }

      // Food
      if (notificationSettings.food?.active && notificationSettings.food.time === currentTimeStr) {
        if (lastNotified.current.food !== currentTimeStr) {
          handleReminder('อย่าลืมบันทึกอาหาร!', 'มื้อนี้ทานอะไรไปบ้าง แวะมาบันทึกกันหน่อย')
          lastNotified.current.food = currentTimeStr
        }
      }

      // Sleep
      if (notificationSettings.sleep?.active && notificationSettings.sleep.time === currentTimeStr) {
        if (lastNotified.current.sleep !== currentTimeStr) {
          handleReminder('ได้เวลานอนแล้ว!', 'พักผ่อนให้เพียงพอ เพื่อสุขภาพที่ดีของคุณ')
          lastNotified.current.sleep = currentTimeStr
        }
      }

      // Water (Interval)
      if (notificationSettings.water?.active) {
        const interval = parseInt(notificationSettings.water.interval) || 2
        // If current minute is 0 and hour is divisible by interval, trigger water
        if (currentMinute === 0 && currentHour % interval === 0) {
          const waterKey = `${currentHour}-water`
          if (lastNotified.current.water !== waterKey) {
            handleReminder('ดื่มน้ำหน่อยไหม?', 'จิบน้ำบ่อยๆ ช่วยให้ร่างกายสดชื่นนะ')
            lastNotified.current.water = waterKey
          }
        }
      }

    }, 60000) // Check every 60 seconds

    return () => clearInterval(intervalId)
  }, [notificationSettings])

  // Request permission on mount if not already granted/denied
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])
}
