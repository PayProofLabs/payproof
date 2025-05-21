"use client"

import { useEffect, useRef } from "react"
import QRCode from "qrcode"

interface ReceiptQRCodeProps {
  url: string
  size?: number
}

export function ReceiptQRCode({ url, size = 160 }: ReceiptQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    QRCode.toCanvas(canvasRef.current, url, {
      width: size,
      margin: 1,
      color: { dark: "#000000", light: "#ffffff" },
    })
  }, [url, size])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      aria-label={`QR code linking to ${url}`}
      className="rounded"
    />
  )
}
