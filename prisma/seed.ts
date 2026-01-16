import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Начинаем заполнение базы данных...')

  // Очистка существующих данных
  await prisma.commentLike.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.userAnimeStatus.deleteMany()
  await prisma.rating.deleteMany()
  await prisma.anime.deleteMany()
  await prisma.loginAttempt.deleteMany()
  await prisma.user.deleteMany()

  // Создаем администратора
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@waka.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@waka.com',
      password: adminPassword,
      role: 'ADMIN'
    }
  })

  // Создаем обычных пользователей
  const userPassword = await bcrypt.hash('user123', 10)
  const users = []
  for (let i = 1; i <= 5; i++) {
    const user = await prisma.user.upsert({
      where: { email: `user${i}@example.com` },
      update: {},
      create: {
        username: `user${i}`,
        email: `user${i}@example.com`,
        password: userPassword,
        role: 'USER'
      }
    })
    users.push(user)
  }

  // Создаем аниме с реальными изображениями
  const animeData = [
    {
      title: 'Атака титанов',
      description: 'Последние остатки человечества живут в укрепленном городе, окруженном огромными стенами. Однажды появляется титан колоссального размера и разрушает внешнюю стену.',
      genre: 'Экшен, Драма, Фэнтези',
      year: 2013,
      studio: 'Toei Animation',
      imageUrl: 'https://m.media-amazon.com/images/M/MV5BMWU1OGEwNmQtNGM3MS00YTYyLThmYmMtN2FjYzQzNzNmNTE0XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    },
    {
      title: 'Демон-истребитель',
      description: 'Юноша становится истребителем демонов после того, как его семья была убита, а младшая сестра превращена в демона.',
      genre: 'Экшен, Сверхъестественное, Драма',
      year: 2019,
      studio: 'Ufotable',
      imageUrl: 'https://m.media-amazon.com/images/M/MV5BMWU1OGEwNmQtNGM3MS00YTYyLThmYmMtN2FjYzQzNzNmNTE0XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
    },
    {
      title: 'Твое имя',
      description: 'Два подростка из разных городов начинают загадочным образом меняться телами во время сна.',
      genre: 'Романтика, Драма, Фэнтези',
      year: 2016,
      studio: 'CoMix Wave Films',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/0/0b/Your_Name_poster.png',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    },
    {
      title: 'Ван-Пис',
      description: 'Приключения пирата Луффи и его команды в поисках легендарного сокровища "Ван-Пис".',
      genre: 'Экшен, Приключения, Комедия',
      year: 1999,
      studio: 'Toei Animation',
      imageUrl: 'https://japanesegallery.com/pub/media/catalog/product/cache/d864fe008ccb1396261d22d112b7dce0/j/g/jgkp1091_copy.jpg'
    },
    {
      title: 'Дзюдзюцу Кайсен',
      description: 'Старшеклассник вступает в тайную организацию заклинателей для борьбы с проклятиями.',
      genre: 'Экшен, Сверхъестественное',
      year: 2020,
      studio: 'Mappa',
      imageUrl: 'https://s3.eu-central-1.wasabisys.com/crealandia.com/wp-content/uploads/2024/03/15123611/mokapy2sample6.jpg.webp',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
    },
    {
      title: 'Унесённые призраками',
      description: 'Девочка попадает в мир духов и должна найти способ спасти своих родителей.',
      genre: 'Фэнтези, Семейный, Приключения',
      year: 2001,
      studio: 'Studio Ghibli',
      imageUrl: 'https://m.media-amazon.com/images/M/MV5BMjlmZmI5MDctNDE2YS00YWE0LWE5ZWItZDBhYWQ0NTcxNWRhXkEyXkFqcGc@._V1_.jpg'
    },
    {
      title: 'Наруто',
      description: 'История юного ниндзя с лисом-демоном внутри, стремящегося стать лидером своей деревни.',
      genre: 'Экшен, Приключения, Боевые искусства',
      year: 2002,
      studio: 'Pierrot',
      imageUrl: 'https://m.media-amazon.com/images/M/MV5BZmQ5NGFiNWEtMmMyMC00MDdiLWI4YWQtZTg0YWE1NWVjNzNiXkEyXkFqcGc@._V1_.jpg'
    },
    {
      title: 'Ходячий замок',
      description: 'Девушка превращается в старуху и отправляется к волшебнику Хаулу за помощью.',
      genre: 'Фэнтези, Романтика, Приключения',
      year: 2004,
      studio: 'Studio Ghibli',
      imageUrl: 'https://m.media-amazon.com/images/M/MV5BMTY1OTg0MjE3MV5BMl5BanBnXkFtZTcwNTMxMzMzMw@@._V1_.jpg'
    }
  ]

  const createdAnime = []
  for (const anime of animeData) {
    try {
      const created = await prisma.anime.create({
        data: {
          ...anime,
          createdBy: admin.id
        }
      })
      createdAnime.push(created)
    } catch (error) {
      console.error(`Ошибка создания аниме ${anime.title}:`, error)
    }
  }

  // Создаем рейтинги
  for (const user of users) {
    for (let i = 0; i < 4; i++) {
      const anime = createdAnime[Math.floor(Math.random() * createdAnime.length)]
      const storyRating = Math.floor(Math.random() * 10) + 1
      const artRating = Math.floor(Math.random() * 10) + 1
      const charactersRating = Math.floor(Math.random() * 10) + 1
      const soundRating = Math.floor(Math.random() * 10) + 1
      const overallRating = (storyRating + artRating + charactersRating + soundRating) / 4

      await prisma.rating.upsert({
        where: {
          unique_user_anime: {
            userId: user.id,
            animeId: anime.id
          }
        },
        update: {},
        create: {
          userId: user.id,
          animeId: anime.id,
          storyRating,
          artRating,
          charactersRating,
          soundRating,
          overallRating
        }
      })
    }
  }

  // Создаем комментарии
  const comments = [
    'Потрясающее аниме! Очень рекомендую к просмотру.',
    'Отличная анимация и сюжет. Не оторваться!',
    'Не ожидал такого поворота событий. Шедевр!',
    'Слишком много филлеров, но в целом неплохо.',
    'Лучшее аниме, которое я когда-либо видел!',
    'Персонажи очень хорошо проработаны.',
    'Музыка просто невероятная. Мурашки по коже.',
    'Концовка разочаровала, но начало было отличным.',
    'Такой киберпанк атмосферы я давно не видел!',
    'Визуальные эффекты на высшем уровне.',
    'Сюжет держит в напряжении до самого конца.',
    'Этому аниме место в топе лучших!'
  ]

  for (const user of users) {
    for (let i = 0; i < 3; i++) {
      const anime = createdAnime[Math.floor(Math.random() * createdAnime.length)]
      const comment = comments[Math.floor(Math.random() * comments.length)]

      await prisma.comment.create({
        data: {
          userId: user.id,
          animeId: anime.id,
          comment: comment
        }
      })
    }
  }

  // Создаем статусы аниме для пользователей
  const statuses = ['PLANNED', 'WATCHING', 'COMPLETED', 'DROPPED'] as const

  for (const user of users) {
    for (let i = 0; i < 4; i++) {
      const anime = createdAnime[Math.floor(Math.random() * createdAnime.length)]
      const status = statuses[Math.floor(Math.random() * statuses.length)]

      await prisma.userAnimeStatus.upsert({
        where: {
          unique_user_anime_status: {
            userId: user.id,
            animeId: anime.id
          }
        },
        update: {},
        create: {
          userId: user.id,
          animeId: anime.id,
          status: status
        }
      })
    }
  }

  console.log('База данных успешно заполнена!')
  console.log(`Создано:`)
  console.log(`- Пользователей: ${users.length + 1} (включая админа)`)
  console.log(`- Аниме: ${createdAnime.length}`)
  console.log('- Рейтинги, комментарии и статусы добавлены')
  console.log('\nДанные для входа:')
  console.log('Админ: admin@waka.com / admin123')
  console.log('Пользователь: user1@example.com / user123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
