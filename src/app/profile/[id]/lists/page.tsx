import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { UserListsDisplay } from '@/components/user-lists-display';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProfileListsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProfileListsPage({
  params
}: ProfileListsPageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  // Получаем пользователя
  const user = await prisma.user.findUnique({
    where: { id: parseInt(id) },
    select: {
      id: true,
      username: true,
      avatar: true,
      email: true,
      _count: {
        select: {
          animeStatuses: true
        }
      }
    }
  });

  if (!user) {
    redirect('/');
  }

  // Получаем статистику
  const userId = parseInt(id);
  const listStats = await prisma.userAnimeStatus.groupBy({
    by: ['status'],
    where: { userId },
    _count: true
  });

  const totalAnime = await prisma.userAnimeStatus.count({
    where: { userId }
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Список аниме {user.username}</h1>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <div>
              <span className="font-semibold text-foreground">{totalAnime}</span> аниме
            </div>
          </div>
        </div>

        {/* Lists Display */}
        <div className="bg-card rounded-lg border p-6">
          <UserListsDisplay userId={id} />
        </div>
      </div>
    </div>
  );
}
