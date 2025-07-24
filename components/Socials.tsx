import Link from "next/link"
import Image from "next/image"

export function Socials() {
  return (
    <div className="fixed bottom-4 left-5 z-10 flex flex-col items-center">
      <img 
        src="/assets/trenchville2.png" 
        alt="TrenchVille Logo" 
        className="w-auto h-auto mb-4" 
      />
      
      {/* Social Links */}
      <div className="flex space-x-4 bg-black/50 p-2 rounded-full">
      <Link href="https://x.com/TrnchVille" target="_blank" className="hover:opacity-80 transition-opacity">
          <Image
              src="/assets/xx.png"
              alt="X"
              width={50}
              height={50}
              className="w-18 h-18"
            />
          </Link>
          <Link href="https://dexscreener.com/solana/" target="_blank" className="hover:opacity-80 transition-opacity">
          <Image
              src="/assets/dexscreener.png"
              alt="dexscreener"
              width={50}
              height={50}
              className="w-18 h-18"
            />
          </Link>
          <Link href="https://github.com/TrenchVille/TrenchVille" target="_blank" className="hover:opacity-80 transition-opacity">
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
  )
}