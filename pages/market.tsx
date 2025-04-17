import Navbar from '../components/Navbar'

export default function Market() {
  return (
    <div>
      <Navbar />
      <main className="grid md:grid-cols-2 gap-8 p-8 items-start">
        <div>
          <h2 className="text-2xl text-highlight mb-2">RVI Score</h2>
          <div className="text-6xl font-bold text-neon">39.7</div>
          <div className="text-sm mt-2 text-green-500">
            ▲ +2.1 in last 24h
          </div>
        </div>
        <div className="bg-gray-950 h-64 flex items-center justify-center rounded border border-highlight">
          <span className="text-gray-600">[ RVI Chart Placeholder ]</span>
        </div>
      </main>
    </div>
  )
}
