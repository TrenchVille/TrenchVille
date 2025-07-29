import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-xl mb-8">Oops! It seems you've ventured into uncharted territory.</p>
      <Link href="/" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md transition-colors duration-200">
        Return to BonkVillage
      </Link>
    </div>
  )
}
