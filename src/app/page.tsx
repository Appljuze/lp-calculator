import LPCalculator from '@/components/LPCalculator'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-6">Liquidity Provider Position Calculator</h1>
        <LPCalculator />
      </div>
    </main>
  )
}