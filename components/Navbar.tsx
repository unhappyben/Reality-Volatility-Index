import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-bg text-neon px-6 py-4 flex justify-between items-center border-b border-highlight">
      <h1 className="text-xl font-bold">RVI</h1>
      <div className="space-x-4">
        <Link href="/" className="hover:underline">Home</Link>
        <Link href="/market" className="hover:underline">Market</Link>
      </div>
    </nav>
  )
}
