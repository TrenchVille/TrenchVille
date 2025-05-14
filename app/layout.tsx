"use client"

import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Link from "next/link"
import { ConnectWallet } from "@/components/ConnectWallet"
import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"
import type React from "react"
import Image from "next/image"

const inter = Inter({ subsets: ["latin"] })

const metadata = {
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
        <img src="/assets/trenchville3.png" alt="TrenchVille Logo" className="w-6 h-6" />
        TrenchVille
        <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded">BETA</span>
      </Link>

      <div className="flex items-center gap-8">
        <Link 
          href="/dashboard"
          className="text-sm hover:text-white/80"
          prefetch={false}
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
        <Link 
          href="https://dexscreener.com/" 
          target="_blank"
          className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded shadow-md transition-all duration-200"
        >
          BUY NOW!
        </Link>
      </div>
    </nav>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isHomePage = pathname === "/"
  
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white`}>
        <DynamicWalletProvider>
          {!isHomePage && (
            <header className="fixed top-0 w-full bg-black border-b border-white/10 z-50">
              <Navigation />
            </header>
          )}
          <div className={isHomePage ? "" : "pt-16 min-h-screen"}>
            {children}
            <div className="fixed bottom-4 z-10 flex flex-col items-center">
              <img 
                src="/assets/trenchville2.png" 
                alt="TrenchVille Logo" 
                className="w-44 h-auto mb-4" 
              />
              
              {/* Social Links */}
              <div className="flex space-x-0 bg-black/50 p-2 rounded-full">
                <Link href="https://x.com" target="_blank" className="hover:opacity-80 transition-opacity">
                  <Image 
                    src="/assets/xx.png" 
                    alt="X" 
                    width={90} 
                    height={90} 
                    className="w-15 h-15" 
                  />
                </Link>
                <Link href="https://dexscreener.com/" target="_blank" className="hover:opacity-80 transition-opacity">
                  <Image 
                    src="/assets/dexscreener.png" 
                    alt="dexscreener" 
                    width={90} 
                    height={90} 
                    className="w-15 h-15" 
                  />
                </Link>
                <Link href="https://dextools.io" target="_blank" className="hover:opacity-80 transition-opacity">
                  <Image 
                    src="/assets/dex.png" 
                    alt="dextools" 
                    width={90} 
                    height={90} 
                    className="w-15 h-15" 
                  />
                </Link>
              </div>
            </div>
          </div>
        </DynamicWalletProvider>
      </body>
    </html>
  )
}