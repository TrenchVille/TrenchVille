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
import { toast } from "sonner"
import Head from "next/head"

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
    <nav className="h-14 px-6 flex items-center justify-between relative">
      <Link href="/" className="flex items-center gap-2 text-xl font-bold">
        <img src="/assets/trenchville3.png" alt="TrenchVille Logo" className="w-6 h-6" />
        TrenchVille
        <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded">BETA</span>
      </Link>

      {/* Contrato - Centrado */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="flex items-center justify-center bg-black/70 px-3 py-1 rounded-md"> 
          <span className="text-gray-400 mr-2">Contract:</span> 
          <span className="text-gray-300 font-mono">BONK.</span> 
          <button  
            className="ml-2 text-gray-400 hover:text-white text-xs" 
            onClick={() => { 
              navigator.clipboard.writeText("BONK"); 
              toast.success("Contract address copied to clipboard!"); 
            }} 
          > 
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> 
              <path d="M8 5H6C4.89543 5 4 5.89543 4 7V19C4 20.1046 4.89543 21 6 21H16C17.1046 21 18 20.1046 18 19V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> 
              <path d="M19 3H9C7.89543 3 7 3.89543 7 5V15C7 16.1046 7.89543 17 9 17H19C20.1046 17 21 16.1046 21 15V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> 
            </svg> 
          </button> 
        </div>
      </div>

      <div className="flex items-center gap-4">
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
        <Link 
          href="https://axiom.trade/pulse" 
          target="_blank"
          className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded shadow-md transition-all duration-200"
        >
          BUY NOW!!
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
      <head>
        <link rel="icon" href="/assets/favicon.ico" />
      </head>
      <body className={`${inter.className} bg-black text-white`}>
        <DynamicWalletProvider>
          {!isHomePage && (
            <header className="fixed top-0 w-full bg-black border-b border-white/10 z-50">
              <Navigation />
            </header>
          )}
          <div className={isHomePage ? "" : "pt-16 min-h-screen"}>
            {children}
            
          </div>
        </DynamicWalletProvider>
      </body>
    </html>
  )
}