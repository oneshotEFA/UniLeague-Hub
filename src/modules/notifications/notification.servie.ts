import { NotificationType } from '../../../generated/prisma';
import { prisma } from '../../config/db';
import { GalleryService } from '../gallery/gallery.service';
export class NotificationService {
  constructor(
    private prismaService = prisma,
    private galleryService: GalleryService
  ) {}
  // send notification
  async sendNotification(
    senderAdminId: string,
    type: NotificationType,
    content: string,
    reciveradminId?: string,
    tournamentId?: string
  ) {
    try {
      if (!senderAdminId) {
        return {
          ok: false,
          error: 'admin id is needed',
        };
      }

      if (!content) {
        return {
          ok: false,
          error: 'content is must to send',
        };
      }

      if (!type) {
        return {
          ok: false,
          error: 'type of the content must be defined',
        };
      }

      const notification = await this.prismaService.notification.create({
        data: {
          type,
          message: content,
          senderAdminId,
          receiverAdminId: reciveradminId,
          tournamentId: tournamentId || null,
        },
      });

      return {
        ok: true,
        data: notification,
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  // broadcasting

  async broadCastToEachAdmin(senderAdminId: string, content: string) {
    try {
      if (!senderAdminId) {
        return {
          ok: false,
          error: 'sender id is required',
        };
      }

      if (!content) {
        return {
          ok: false,
          error: 'content is requird',
        };
      }

      const receivers = await this.prismaService.admin.findMany();
      if (receivers.length === 0) {
        return {
          ok: false,
          error: 'no admin is found',
        };
      }
      const createNotifications = await Promise.all(
        receivers.map(admin =>
          this.prismaService.notification.create({
            data: {
              type: NotificationType.BROADCAST,
              message: content,
              receiverAdminId: admin.id,
              senderAdminId,
            },
          })
        )
      );
      return {
        ok: true,
        count: createNotifications.length,
        data: createNotifications,
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }
  // broadcast tournament

  async broadCastToTournament(
    senderAdminId: string,
    tournamentId: string,
    content: string,
    photo?: Express.Multer.File
  ) {
    try {
      if (!senderAdminId) {
        return {
          ok: false,
          error: 'sender admin id is required',
        };
      }

      if (!tournamentId) {
        return {
          ok: false,
          error: ' tournament id is required',
        };
      }

      if (!content) {
        return {
          ok: false,
          error: 'content to notfication is required',
        };
      }
      const tournament = await this.prismaService.tournament.findUnique({
        where: { id: tournamentId },
      });
      if (!tournament) {
        return {
          ok: false,
          error: 'There is no tournament with this id',
        };
      }
      const notfication = await this.prismaService.notification.create({
        data: {
          type: NotificationType.TOURNAMENT_UPDATE,
          senderAdminId,
          message: content,
          tournamentId,
        },
      });
      if (photo) {
        await this.galleryService.savePicture(
          photo.buffer,
          notfication.id,
          'TOURNAMENT',
          'BANNER'
        );
      }
      return {
        ok: true,
        data: notfication,
      };
    } catch (error: any) {
      return {
        ok: false,
        erro: error.message,
      };
    }
  }
  // get admin notifications
  async getAdminNotification(adminId: string) {
    try {
      if (!adminId) {
        return {
          ok: false,
          error: 'must have admin id to get the notification',
        };
      }
      const notfication = await this.prismaService.notification.findMany({
        where: {
          receiverAdminId: adminId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (notfication.length === 0) {
        return {
          ok: true,
          error: 'no notification by this admin found',
        };
      }
      return {
        ok: true,
        count: notfication.length,
        data: notfication,
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  //get broadcast notifications
  async getBroadCastNotification(adminId: string) {
    try {
      if (!adminId) {
        return {
          ok: false,
          error: ' admin id is must ',
        };
      }

      const getNotification = await this.prismaService.notification.findMany({
        where: {
          type: NotificationType.BROADCAST,
          receiverAdminId: adminId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return {
        ok: true,
        count: getNotification.length,
        data: getNotification,
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  // get tournament broadcass
  async getTournamentBroadCast(tournamentId: string) {
    try {
      if (!tournamentId) {
        return {
          ok: false,
          error: 'tournament id must be provided',
        };
      }
      const notifications  = await this.prismaService.notification.findMany({
        where: {
          type: NotificationType.TOURNAMENT_UPDATE,
          tournamentId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      const notificationsWithPhoto = await Promise.all(
        notifications.map(async notification => {
          const media = await this.prismaService.mediaGallery.findMany({
            where: {
              ownerId: notification.id,
            },
          });
          return {
            ...notification,
            media,
          };
        })
      );

      return {
        ok: true,
        count: notificationsWithPhoto.length,
        data: notificationsWithPhoto
      };
      
    } catch (error: any) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  // system call
  async systemCall(adminId: string, content: object) {
    try {
      if (!adminId) {
        return {
          ok: false,
          error: 'admin id is required',
        };
      }

      if (!content) {
        return {
          ok: false,
          error: 'content must provide',
        };
      }
      const stringMessage = JSON.stringify(content);
      const notification = await this.prismaService.notification.create({
        data: {
          type: NotificationType.SYSTEM,
          message: stringMessage,
          receiverAdminId: adminId,
          senderAdminId: null,
        },
      });
      return {
        ok: true,
        data: notification,
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }
}
