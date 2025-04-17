import Navbar from '../components/Navbar'
import FivePillars from '../components/FivePillars'


export default function Home() {
  return (
    <div>
      <Navbar />
      <main>
      <section className="flex flex-col items-center justify-center py-32 px-4 text-center space-y-4">
                <h1 className="text-5xl md:text-7xl font-bold text-faded tracking-tight leading-tight">
                  Reality Volatility Index
                </h1>

                <p className="text-neon text-lg md:text-xl font-mono italic">
                  Markets react to prices. RVI reacts to belief.
                </p>

                <p className="text-sm text-gray-400 font-mono max-w-md">
                  Quantified in real-time, powered by{' '}
                  <a
                    href="https://adj.news"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-neon"
                  >
                    adj.news
                  </a>
                  .
                </p>
              </section>

            <FivePillars />
      </main>
    </div>
  )
}
