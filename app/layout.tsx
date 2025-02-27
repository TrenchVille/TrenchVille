import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Link from "next/link"
import { ConnectWallet } from "@/components/ConnectWallet"
import dynamic from "next/dynamic"
import type React from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TrenchVille",
  description: "TrenchVille Dashboard",
}

const DynamicWalletProvider = dynamic(() => import("@/components/WalletProvider").then((mod) => mod.WalletProvider), {
  ssr: false,
})

// Modified Navigation component with proper route handling
const Navigation = () => {
  return (
    <nav className="h-14 px-6 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2 text-xl font-bold">
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        TrenchVille
        <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded">BETA</span>
      </Link>

      <div className="flex items-center gap-8">
        <Link 
          href="/"
          className="text-sm hover:text-white/80"
          prefetch={false} // Disable prefetching to ensure proper cleanup
        >
          Dashboard
        </Link>
        <Link href="/town-hall" className="text-sm hover:text-white/80" prefetch={false}>
          Town Hall
        </Link>
        <Link href="/api" className="text-sm hover:text-white/80" prefetch={false}>
          API
        </Link>
        <Link href="/Holders" className="text-sm hover:text-white/80" prefetch={false}>
          Holders
        </Link>
        <ConnectWallet />
      </div>
    </nav>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white`}>
        <DynamicWalletProvider>
          <header className="fixed top-0 w-full bg-black border-b border-white/10 z-50">
            <Navigation />
          </header>
          <div className="pt-16 min-h-screen">{children}</div>
        </DynamicWalletProvider>
      </body>
    </html>
  )
}