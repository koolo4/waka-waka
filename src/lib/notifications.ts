import { prisma } from './prisma';

export type NotificationType =
  | 'friend_request'
  | 'friend_accepted'
  | 'comment'
  | 'rating'
  | 'recommendation'
  | 'system';

interface CreateNotificationOptions {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: number;
}

/**
 * Создает уведомление для пользователя
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  relatedId
}: CreateNotificationOptions) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        relatedId
      }
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Отправляет уведомление о друзьях запросе
 */
export async function notifyFriendRequest(
  senderId: number,
  receiverId: number,
  senderName: string
) {
  return createNotification({
    userId: receiverId,
    type: 'friend_request',
    title: 'Новый запрос в друзья',
    message: `${senderName} отправил(а) вам запрос в друзья`,
    relatedId: senderId
  });
}

/**
 * Отправляет уведомление о принятии запроса друзья
 */
export async function notifyFriendAccepted(
  userId: number,
  friendName: string,
  friendId: number
) {
  return createNotification({
    userId,
    type: 'friend_accepted',
    title: 'Запрос принят',
    message: `${friendName} принял(а) ваш запрос в друзья`,
    relatedId: friendId
  });
}

/**
 * Отправляет уведомление о новом комментарии
 */
export async function notifyNewComment(
  authorId: number,
  animeId: number,
  commenterName: string,
  commentText: string
) {
  return createNotification({
    userId: authorId,
    type: 'comment',
    title: `Новый комментарий на аниме`,
    message: `${commenterName}: ${commentText.substring(0, 100)}${commentText.length > 100 ? '...' : ''}`,
    relatedId: animeId
  });
}

/**
 * Отправляет уведомление о новой оценке
 */
export async function notifyNewRating(
  authorId: number,
  animeId: number,
  raterName: string,
  rating: number
) {
  return createNotification({
    userId: authorId,
    type: 'rating',
    title: `Новая оценка на аниме`,
    message: `${raterName} оценил(а) аниме на ${rating}/10`,
    relatedId: animeId
  });
}

/**
 * Отправляет рекомендацию
 */
export async function notifyRecommendation(
  userId: number,
  animeId: number,
  animeName: string,
  reason: string
) {
  return createNotification({
    userId,
    type: 'recommendation',
    title: `Вам рекомендуют "${animeName}"`,
    message: `Мы думаем, вам понравится это аниме. Причина: ${reason}`,
    relatedId: animeId
  });
}

/**
 * Отправляет системное уведомление
 */
export async function notifySystem(
  userId: number,
  title: string,
  message: string
) {
  return createNotification({
    userId,
    type: 'system',
    title,
    message
  });
}

/**
 * Отправляет уведомление нескольким пользователям
 */
export async function notifyMultipleUsers(
  userIds: number[],
  type: NotificationType,
  title: string,
  message: string,
  relatedId?: number
) {
  try {
    const notifications = await prisma.notification.createMany({
      data: userIds.map(userId => ({
        userId,
        type,
        title,
        message,
        relatedId
      }))
    });

    return notifications;
  } catch (error) {
    console.error('Error notifying multiple users:', error);
    throw error;
  }
}
