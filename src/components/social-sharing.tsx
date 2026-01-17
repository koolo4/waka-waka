'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Share2, 
  Copy, 
  Twitter, 
  Facebook, 
  Link as LinkIcon,
  Check,
  Mail,
  MessageCircle
} from 'lucide-react'

interface SocialSharingProps {
  title: string
  description?: string
  shareUrl: string
  image?: string
}

export function SocialSharing({
  title,
  description = '',
  shareUrl,
  image
}: SocialSharingProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareOnTwitter = () => {
    const text = `${title}${description ? ' - ' + description : ''}`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank')
  }

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank')
  }

  const shareViaEmail = () => {
    const subject = title
    const body = `${title}\n${description}\n\n${shareUrl}`
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailtoLink
  }

  const shareViaWhatsApp = () => {
    const text = `${title}${description ? ' - ' + description : ''} ${shareUrl}`
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  return (
    <div className="w-full">
      <div className="space-y-3">
        {/* Link Copy Section */}
        <div className="flex gap-2 p-4 rounded-lg bg-background/50 border border-cyan-500/20 hover:border-cyan-400 transition-colors">
          <div className="flex-1 flex items-center gap-2 bg-card rounded px-3 py-2 font-mono text-sm text-muted-foreground overflow-hidden text-ellipsis">
            <LinkIcon className="h-4 w-4 text-cyan-400 flex-shrink-0" />
            <span className="overflow-hidden text-ellipsis whitespace-nowrap">{shareUrl}</span>
          </div>
          <Button
            onClick={handleCopyLink}
            className={`cyber-button flex items-center gap-2 ${
              copied
                ? 'bg-green-500/20 border-green-500/50 text-green-400'
                : 'border-cyan-500/50 text-cyan-400 hover:border-cyan-400'
            }`}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Скопировано
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Копировать
              </>
            )}
          </Button>
        </div>

        {/* Social Buttons Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Twitter */}
          <Button
            onClick={shareOnTwitter}
            className="cyber-button flex flex-col items-center gap-2 py-6 h-auto bg-gradient-to-b from-blue-500/20 to-blue-600/20 border-blue-500/30 hover:border-blue-400 text-blue-400 hover:text-blue-300"
          >
            <Twitter className="h-6 w-6" />
            <span className="text-xs font-mono">Twitter</span>
          </Button>

          {/* Facebook */}
          <Button
            onClick={shareOnFacebook}
            className="cyber-button flex flex-col items-center gap-2 py-6 h-auto bg-gradient-to-b from-blue-600/20 to-blue-700/20 border-blue-600/30 hover:border-blue-500 text-blue-500 hover:text-blue-400"
          >
            <Facebook className="h-6 w-6" />
            <span className="text-xs font-mono">Facebook</span>
          </Button>

          {/* WhatsApp */}
          <Button
            onClick={shareViaWhatsApp}
            className="cyber-button flex flex-col items-center gap-2 py-6 h-auto bg-gradient-to-b from-green-500/20 to-green-600/20 border-green-500/30 hover:border-green-400 text-green-400 hover:text-green-300"
          >
            <MessageCircle className="h-6 w-6" />
            <span className="text-xs font-mono">WhatsApp</span>
          </Button>

          {/* Email */}
          <Button
            onClick={shareViaEmail}
            className="cyber-button flex flex-col items-center gap-2 py-6 h-auto bg-gradient-to-b from-red-500/20 to-red-600/20 border-red-500/30 hover:border-red-400 text-red-400 hover:text-red-300"
          >
            <Mail className="h-6 w-6" />
            <span className="text-xs font-mono">Email</span>
          </Button>
        </div>

        {/* Info Badge */}
        <Badge className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 w-full justify-center py-2 font-mono text-xs">
          <Share2 className="h-3 w-3 mr-2" />
          Поделитесь ссылкой с друзьями
        </Badge>
      </div>
    </div>
  )
}
