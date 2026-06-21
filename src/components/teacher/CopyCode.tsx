"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/Button"

export function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <Button variant="ghost" size="icon" onClick={copy} className="h-7 w-7 rounded-lg text-text-muted hover:text-primary">
      {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
    </Button>
  )
}
