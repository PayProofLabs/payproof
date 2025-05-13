"use client"

import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import type { StellarNetwork } from "@/types/stellar"

interface NetworkSelectorProps {
  selectedNetwork: StellarNetwork
  onNetworkChange: (network: StellarNetwork) => void
  disabled?: boolean
}

export function NetworkSelector({ selectedNetwork, onNetworkChange, disabled = false }: NetworkSelectorProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Network</Label>
      <div className="flex gap-4">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name="network"
            value="testnet"
            checked={selectedNetwork === 'testnet'}
            onChange={(e) => onNetworkChange(e.target.value as StellarNetwork)}
            disabled={disabled}
            className="w-4 h-4 text-primary bg-background border-border focus:ring-primary focus:ring-2"
          />
          <span className="text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
            Testnet
          </span>
        </label>
        
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name="network"
            value="mainnet"
            checked={selectedNetwork === 'mainnet'}
            onChange={(e) => onNetworkChange(e.target.value as StellarNetwork)}
            disabled={disabled}
            className="w-4 h-4 text-primary bg-background border-border focus:ring-primary focus:ring-2"
          />
          <span className="text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Mainnet
          </span>
        </label>
      </div>
      
      <div className="text-xs text-muted-foreground">
        {selectedNetwork === 'testnet' ? (
          <p>🟡 Using Stellar Testnet for development and testing</p>
        ) : (
          <p>🟢 Using Stellar Mainnet for production transactions</p>
        )}
      </div>
    </div>
  )
}

interface NetworkBadgeProps {
  network: StellarNetwork
  className?: string
}

export function NetworkBadge({ network, className = "" }: NetworkBadgeProps) {
  return (
    <Badge 
      variant={network === 'mainnet' ? 'default' : 'secondary'} 
      className={`${className} ${network === 'mainnet' ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'}`}
    >
      {network === 'mainnet' ? '🟢' : '🟡'} {network === 'mainnet' ? 'Mainnet' : 'Testnet'} Transaction
    </Badge>
  )
}