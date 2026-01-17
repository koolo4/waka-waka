import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ChatInterface } from '@/components/chat-interface'
import { MessageSquare } from 'lucide-react'

export default async function MessagesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen relative">
      {/* Matrix Rain Background */}
      <div className="matrix-rain"></div>
      <div className="digital-particles"></div>

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Cyber Header */}
        <div className="text-center mb-8">
          <div className="cyber-badge inline-flex items-center gap-2 mb-4">
            <MessageSquare className="h-4 w-4" />
            <span>DIRECT MESSAGING SYSTEM</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 neon-text">
            ЛИЧНАЯ ПЕРЕПИСКА
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Обменяйтесь сообщениями с друзьями в реальном времени
          </p>
        </div>

        {/* Chat Interface */}
        <ChatInterface />
      </div>
    </div>
  )
}
