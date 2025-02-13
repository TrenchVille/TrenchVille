"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { clsx } from "clsx"

require("@solana/wallet-adapter-react-ui/styles.css")

export function ConnectWallet() {
  const { connected, publicKey } = useWallet()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <Button className="bg-[#7C3AED] hover:bg-[#6D28D9]">Connect Wallet</Button>
  }

  return (
    <WalletMultiButton
      className={clsx(
        "wallet-adapter-button-trigger",
        "bg-[#7C3AED] hover:bg-[#6D28D9]",
        "rounded font-semibold",
        "px-4 py-2",
        "transition-colors",
      )}
    >
      {connected ? `${publicKey?.toBase58().slice(0, 4)}...${publicKey?.toBase58().slice(-4)}` : "Connect Wallet"}
    </WalletMultiButton>
  )
}

