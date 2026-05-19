import { motion, useSpring, useTransform } from 'framer-motion'
import { useEffect } from 'react'

export default function AnimatedCounter({ value, isNumber = true, className = "", style }) {
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value
  
  const spring = useSpring(0, {
    stiffness: 75,
    damping: 15,
    mass: 1
  })

  const display = useTransform(spring, (current) => {
    if (!isNumber) return value
    return Math.round(current).toLocaleString()
  })

  useEffect(() => {
    if (isNumber) {
      spring.set(numericValue)
    }
  }, [numericValue, spring, isNumber])

  return (
    <motion.span className={className} style={style}>
      {isNumber ? display : value}
    </motion.span>
  )
}
