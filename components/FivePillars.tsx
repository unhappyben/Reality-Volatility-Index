'use client'
import { motion } from 'framer-motion'
import Tooltip from './Tooltip'

const signals = [
  {
    title: 'Impact Severity',
    description: 'How consequential the event is if it occurs.',
    tooltip:
      'Score = Base (by topic tag) + Scope Modifier + Phrasing Boost. Range: 0.3 – 1.0'
  },
  {
    title: 'Time Horizon',
    description: 'How soon the event resolves.',
    tooltip:
      'Score based on time to expiry: <30d = 1.0, >1y = 0.2. Encourages current-cycle volatility.'
  },
  {
    title: 'Volatility',
    description: 'How much the market’s belief has fluctuated recently.',
    tooltip:
      'Calculated using standard deviation of probability over the past 48–72h. High = narrative churn.'
  },
  {
    title: 'Liquidity',
    description: 'How much money or forecasting activity is in the market.',
    tooltip:
      'Ranked by YES/NO share volume. Top 10% = 1.0, Bottom 50% = 0.5. More money = stronger signal.'
  },
  {
    title: 'Platform Diversity',
    description: 'Whether this market is mirrored across platforms.',
    tooltip:
      'Multiplier boost: 1.2 if listed on 3+ platforms. Reflects shared salience and consensus.'
  }
]

export default function FivePillars() {
  return (
    <section className="bg-bg text-faded px-4 pt-8 pb-24">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 justify-items-center">
        {signals.map((signal, i) => (
          <motion.div
            key={signal.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
          >
            <Tooltip content={signal.tooltip}>
              <div className="w-[320px] h-[120px] border border-highlight bg-gray-950 rounded-xl p-4 hover:shadow-[0_0_10px_#00ff99] transition-all cursor-help flex flex-col items-center justify-center text-center">
                <h3 className="text-neon text-sm font-bold mb-2">
                  {signal.title}
                </h3>
                <p className="text-xs text-gray-400 font-mono">
                  {signal.description}
                </p>
              </div>
            </Tooltip>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
