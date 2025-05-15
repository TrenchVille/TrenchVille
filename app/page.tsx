"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Image from "next/image"
import { toast } from "sonner" // Añade esta importación

export default function EntryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const handleEnterClick = () => {
    setLoading(true)
    router.push('/dashboard')
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Video Background */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline
        className="absolute w-full h-full object-cover z-0"
      >
        <source src="/assets/highway-loop.mp4" type="video/mp4" />
      </video>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 z-10"></div>
      
      {/* Navigation Button - Top Right */}
      <div className="absolute top-4 right-4 z-50">
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          className="bg-transparent hover:bg-black/30 p-2 transition-all duration-200"
          aria-label="Menu"
        >
          {menuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 6H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 18H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>
      
      {/* Full Page Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/90 z-40 flex flex-col items-center justify-center">
          <div className="absolute top-0 left-0 p-4">
            <Link href="/" className="text-white text-xl font-bold">TRENCHVILLE</Link>
          </div>
          
          <nav className="flex flex-col items-center space-y-6 text-center">
            <Link 
              href="/" 
              className="text-white text-xl hover:text-gray-300 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              HOME
            </Link>
            <Link 
              href="/dashboard" 
              className="text-white text-xl hover:text-gray-300 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              ENTER TRENCHVILLE
            </Link>
            <Link 
              href="https://x.com/TrnchVille" 
              target="_blank"
              className="text-white text-xl hover:text-gray-300 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              X | TWITTER
            </Link>
            <Link 
              href="https://dexscreener.com/solana/fwvbhm2dpnodww7dlxlymwvf5dsxa5ey767gqhjae8vu" 
              target="_blank"
              className="text-white text-xl hover:text-gray-300 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              DEXSCREENER
            </Link>
            <Link 
              href="https://github.com/trenchville/trenchville" 
              target="_blank"
              className="text-white text-xl hover:text-gray-300 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              GITHUB
            </Link>
          </nav>
          
          <div className="absolute bottom-4 text-center text-white/60 text-sm">
            TRENCHVILLE: A PLACE FOR DEGENS
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-center text-white text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold mb-8">WELCOME TO</h1>
        
        {/* Logo */}
        <div className="mb-12 flex flex-col items-center">
          <Image 
            src="/assets/trenchville-logo.webp" 
            alt="TrenchVille Logo" 
            width={300} 
            height={150}
            className="mb-4"
            priority
          />
          <p className="mt-2 text-lg text-gray-300">A place for Solana Degens</p>
          <div className="mt-2 flex items-center justify-center bg-black/70 px-3 py-1 rounded-md">
            <span className="text-gray-400 mr-2">Contract:</span>
            <span className="text-gray-300 font-mono">4j9tpEHpBjpoEuFdV6NP5qzac7vaQ1rHG7ppbS3ocEK6.</span>
            <button 
              className="ml-2 text-gray-400 hover:text-white text-xs"
              onClick={() => {
                navigator.clipboard.writeText("4j9tpEHpBjpoEuFdV6NP5qzac7vaQ1rHG7ppbS3ocEK6");
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
        
        {/* Enter Button using Image */}
        <div className="mb-16 cursor-pointer" onClick={handleEnterClick}>
          <Image 
            src="/assets/enter.webp" 
            alt="ENTER TRENCHVILLE" 
            width={300} 
            height={80}
            className={`transition-all duration-300 ${loading ? 'opacity-70' : 'hover:scale-105'}`}
            priority
          />
        </div>
        
        {/* Social Links */}
        <div className="flex space-x-14">
          <Link href="https://x.com/TrnchVille" target="_blank" className="hover:opacity-80 transition-opacity">
          <Image
              src="/assets/xx.png"
              alt="X"
              width={50}
              height={50}
              className="w-18 h-18"
            />
          </Link>
          <Link href="https://dexscreener.com/solana/fwvbhm2dpnodww7dlxlymwvf5dsxa5ey767gqhjae8vu" target="_blank" className="hover:opacity-80 transition-opacity">
          <Image
              src="/assets/dexscreener.png"
              alt="dexscreener"
              width={50}
              height={50}
              className="w-18 h-18"
            />
          </Link>
          <Link href="https://github.com/trenchville/trenchville" target="_blank" className="hover:opacity-80 transition-opacity">
          <Image
              src="/assets/github.png"
              alt="github"
              width={50}
              height={50}
              className="w-18 h-18"
            />
          </Link>
        </div>
      </div>
    </div>
  )
}
