import { useEffect, useState } from 'react'

export default function WalletButton({ onConnect, onDisconnect, onFindMe }) {
  const [wallet, setWallet] = useState(null)
  const [publicKey, setPublicKey] = useState(null)

  useEffect(() => {
    const checkWallet = async () => {
      try {
        const phantom = window?.phantom?.solana
        
        if (phantom?.isPhantom) {
          setWallet(phantom)
          
          if (phantom.isConnected) {
            const response = await phantom.connect()
            setPublicKey(response.publicKey.toString())
            onConnect(response.publicKey.toString())
          }
        }
      } catch (error) {
        console.error("Wallet check failed:", error)
      }
    }

    checkWallet()
  }, [onConnect])

  const connectWallet = async () => {
    try {
      if (!wallet) {
        window.open('https://phantom.app/', '_blank')
        return
      }

      const response = await wallet.connect()
      setPublicKey(response.publicKey.toString())
      onConnect(response.publicKey.toString())
    } catch (error) {
      console.error("Connection failed:", error)
    }
  }

  const disconnectWallet = async () => {
    try {
      await wallet?.disconnect()
      setPublicKey(null)
      onDisconnect()
    } catch (error) {
      console.error("Disconnect failed:", error)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000,
      display: 'flex',
      gap: '10px'
    }}>
      {!publicKey ? (
        <button
          onClick={connectWallet}
          style={{
            background: '#9945FF',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Connect Wallet
        </button>
      ) : (
        <>
          <button
            onClick={onFindMe}
            style={{
              background: '#14F195',
              color: 'black',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Find Me
          </button>
          <button
            onClick={disconnectWallet}
            style={{
              background: '#DC2626',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Disconnect
          </button>
        </>
      )}
    </div>
  )
}
