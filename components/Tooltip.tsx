'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

export default function Tooltip({
  children,
  content
}: {
  children: React.ReactNode
  content: string
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}

      <AnimatePresence>
        {visible && (
          <motion.div
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-xs text-gray-300 px-3 py-2 rounded-md shadow-lg z-50 w-52 text-center border border-highlight"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
