import Link from "next/link"
import Image from "next/image"

export function Socials() {
  return (
    <div className="fixed bottom-4 left-0 z-10 flex flex-col items-center">
      <img 
        src="/assets/trenchville2.png" 
        alt="TrenchVille Logo" 
        className="w-auto h-auto mb-4" 
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
  )
}