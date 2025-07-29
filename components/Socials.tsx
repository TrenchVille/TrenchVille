import Link from "next/link"
import Image from "next/image"

export function Socials() {
  return (
    <div className="fixed bottom-4 left-0 z-10 flex flex-col items-center">
      <img 
        src="/assets/bonkvillage2.png" 
        alt="BonkVillage Logo" 
        className="w-60 h-auto mb-2" 
      />
      
      {/* Social Links */}
      <div className="flex space-x-4 bg-black/50 p-2 rounded-full">
      <Link href="https://x.com/BonkVillage" target="_blank" className="hover:opacity-80 transition-opacity">
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
          <Link href="https://letsbonk.fun/" target="_blank" className="hover:opacity-80 transition-opacity">
          <Image
              src="/assets/bonk.png"
              alt="bonk"
              width={50}
              height={50}
              className="w-18 h-18"
            />
          </Link>
      </div>
    </div>
  )
}