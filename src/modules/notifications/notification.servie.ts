import { AdminRole, NotificationType } from "../../../generated/prisma";
import { prisma } from "../../config/db.config";
import { GalleryService } from "../gallery/gallery.service";
import transporter from "../../config/mail.config";
import {
  CoachCredentials,
  generateManagerEmailHTML,
  generateTeamAccessEmailHTML,
  ManagerCredentials,
} from "./utility";

interface NewsContent {
  type?: string;
  message?: string;
  title?: string;
  body?: string;
  category?: string;
  image?: Express.Multer.File;
}
export class NotificationService {
  constructor(
    private prismaService = prisma,
    private galleryService: GalleryService,
  ) {}
  // send notification
  async sendNotification(
    senderAdminId: string,
    message: string,
    reciveradminId: string,
  ) {
    try {
      if (!senderAdminId) {
        return {
          ok: false,
          error: "admin id is needed",
        };
      }

      if (!message) {
        return {
          ok: false,
          error: "message must be there",
        };
      }
      if (!reciveradminId) {
        return { ok: false, error: "receiver admin id is required" };
      }

      const notification = await this.prismaService.notification.create({
        data: {
          type: NotificationType.DIRECT_MESSAGE,
          message: message,
          senderAdminId,
          receiverAdminId: reciveradminId,
        },
        select: { id: true },
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

  async broadCastToEachAdmin(
    senderAdminId: string,
    content: {
      type: string;
      message: string;
      title: string;
      critical: "critical" | "serious" | "warning" | "error";
    },
  ) {
    try {
      if (!senderAdminId) {
        return {
          ok: false,
          error: "sender id is required",
        };
      }

      if (!content) {
        return {
          ok: false,
          error: "content is requird",
        };
      }

      const receivers = await this.prismaService.admin.findMany();
      if (receivers.length === 0) {
        return {
          ok: false,
          error: "no admin is found",
        };
      }
      const createNotifications = await Promise.all(
        receivers.map((admin) =>
          this.prismaService.notification.create({
            data: {
              type: NotificationType.DIRECT_MESSAGE,
              meta: content,
              receiverAdminId: admin.id,
              senderAdminId,
            },
          }),
        ),
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
    content: {
      content: string;
      title: string;
      excerpt: string;
    },
    photo?: Express.Multer.File,
  ) {
    try {
      if (!senderAdminId) {
        return {
          ok: false,
          error: "sender admin id is required",
        };
      }

      if (!tournamentId) {
        return {
          ok: false,
          error: " tournament id is required",
        };
      }

      if (!content) {
        return {
          ok: false,
          error: "content to notfication is required",
        };
      }

      const tournament = await this.prismaService.tournament.findUnique({
        where: { id: tournamentId },
      });
      if (!tournament) {
        return {
          ok: false,
          error: "There is no tournament with this id",
        };
      }
      const notfication = await this.prismaService.notification.create({
        data: {
          type: NotificationType.TOURNAMENT_UPDATE,
          senderAdminId,
          meta: typeof content === "string" ? JSON.parse(content) : content,

          tournamentId,
        },
      });
      if (photo) {
        await this.galleryService.savePicture(
          photo.buffer,
          notfication.id,
          "TOURNAMENT",
          "BANNER",
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
          error: "must have admin id to get the notification",
        };
      }
      const notfication = await this.prismaService.notification.findMany({
        where: {
          OR: [{ receiverAdminId: adminId }, { senderAdminId: adminId }],
          type: NotificationType.DIRECT_MESSAGE,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (notfication.length === 0) {
        return {
          ok: true,
          error: "no notification by this admin found",
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
  async getBroadCastNotification(page: number = 1) {
    try {
      const limit = 10;
      const skip = (page - 1) * limit;

      const where = {
        type: NotificationType.BROADCAST,
      };

      const [notifications, totalItems] = await Promise.all([
        this.prismaService.notification.findMany({
          where,
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            sender: {
              select: { username: true },
            },
            type: true,
            message: true,
            meta: true,
            createdAt: true,
          },
          skip,
          take: limit,
        }),
        this.prismaService.notification.count({ where }),
      ]);
      const result = await Promise.all(
        notifications.map(async (not) => {
          const Image = await this.prismaService.mediaGallery.findMany({
            where: { ownerId: not.id },
            select: {
              url: true,
            },
          });
          return {
            ...not,
            Image: Image[0].url,
          };
        }),
      );

      return {
        ok: true,
        data: result,
        meta: {
          page,
          limit,
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
        },
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error.message,
        meta: {
          page,
          limit: 0,
          totalItems: 0,
          totalPages: 0,
        },
      };
    }
  }

  // get tournament broadcass
  async getTournamentBroadCast(tournamentId: string, page = 1) {
    try {
      const limit = 10;
      const skip = (page - 1) * limit;

      const where = {
        type: NotificationType.TOURNAMENT_UPDATE,
        tournamentId,
      };

      const [notifications, totalItems] = await Promise.all([
        this.prismaService.notification.findMany({
          where: { type: NotificationType.TOURNAMENT_UPDATE, tournamentId },
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            sender: {
              select: { username: true },
            },
            type: true,
            message: true,
            meta: true,
            createdAt: true,
          },
          skip,
          take: limit,
        }),
        this.prismaService.notification.count({ where }),
      ]);
      const result = await Promise.all(
        notifications.map(async (not) => {
          const Image = await this.prismaService.mediaGallery.findMany({
            where: { ownerId: not.id },
            select: {
              url: true,
            },
          });
          return {
            ...not,
            Image: Image[0]?.url ?? "",
          };
        }),
      );

      return {
        ok: true,
        data: result,
        meta: {
          page,
          limit,
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
        },
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error.message,
        meta: {
          page,
          limit: 0,
          totalItems: 0,
          totalPages: 0,
        },
      };
    }
  }

  // delete News
  async deleteBroadCast(notifcationId: string) {
    try {
      if (!notifcationId) {
        return {
          ok: false,
          error: "notification id requierd ",
        };
      }
      const notfication = await this.prismaService.notification.findUnique({
        where: { id: notifcationId },
      });
      if (!notfication) {
        return {
          ok: false,
          error: "there is no any notificaion with this id",
        };
      }
      const deleteNotificaion = await this.prismaService.notification.delete({
        where: { id: notifcationId },
      });
      return {
        ok: true,
        data: deleteNotificaion,
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  // update news
  async updateBroadCast(notificationId: string, content: NewsContent) {
    try {
      if (!notificationId) {
        return { ok: false, error: "notification id is required" };
      }

      const notification = await this.prismaService.notification.findUnique({
        where: { id: notificationId },
      });

      if (!notification) {
        return { ok: false, error: "No notification found with this id" };
      }

      const oldMeta =
        typeof notification.meta === "object" && notification.meta !== null
          ? (notification.meta as Record<string, any>)
          : {};

      const updatedMeta = {
        ...oldMeta,
        message: content.message ?? oldMeta.message,
        title: content.title ?? oldMeta.title,
        body: content.body ?? oldMeta.body,
        category: content.category ?? oldMeta.category,
        image: content.image ?? oldMeta.image,
      };

      const updatedNotification = await this.prismaService.notification.update({
        where: { id: notificationId },
        data: {
          type: (content.type as any) ?? notification.type,
          meta: updatedMeta,
        },
      });

      return { ok: true, data: updatedNotification };
    } catch (error: any) {
      return { ok: false, error: error.message };
    }
  }

  // broadcast to the web
  async broadCastToWeb(
    content: {
      content: string;
      title: string;
      excerpt: string;
      adminId?: string;
    },
    image?: Express.Multer.File,
  ) {
    try {
      if (!content) {
        return {
          ok: false,
          error: "data requireid",
        };
      }

      const broadCast = await this.prismaService.notification.create({
        data: {
          type: NotificationType.BROADCAST,
          senderAdminId: content.adminId ?? "",
          meta: {
            type: content.excerpt,
            title: content.title,
            contetn: content.content,
          },
        },
      });
      if (image?.buffer) {
        const post = await this.galleryService.savePicture(
          image.buffer,
          broadCast.id,
          "WEB",
          "COVER",
          true,
        );
      }
      return {
        ok: true,
        data: broadCast,
      };
    } catch (error: any) {
      throw new Error(`News failed: ${(error as Error).message}`);
    }
  }

  // system call
  async systemCall(content: {
    WhatType: string;
    message: string;
    category: string;
    messageDeveloper: string;
    severity: "critical" | "serious" | "warning" | "error";
  }) {
    try {
      if (!content) {
        return {
          ok: false,
          error: "content must provide",
        };
      }
      const superAdmins = await this.prismaService.admin.findMany({
        where: { role: AdminRole.superAdmin },
        select: { id: true },
      });
      if (superAdmins.length === 0) {
        return {
          ok: true,
          message: "there is no any super admin",
        };
      }

      const systemLog = await this.prismaService.notification.create({
        data: {
          type: NotificationType.SYSTEM,
          meta: {
            type: content.WhatType,
            message: content.message,
            category: content.category,
            messageDeveloper: content.messageDeveloper,
            severity: content.severity,
          },
        },
      });
      return {
        ok: true,
        data: systemLog,
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  // get system calls
  async getSystemCalls() {
    try {
      const systemLogs = await this.prismaService.notification.findMany({
        where: {
          receiverAdminId: null,
          senderAdminId: null,
          tournamentId: null,
        },
        select: { id: true, type: true, meta: true, createdAt: true },
      });
      if (systemLogs.length === 0) {
        return {
          ok: true,
          message: "there is no any system logs for the time",
        };
      }
      return {
        ok: true,
        count: systemLogs.length,
        data: systemLogs,
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  //send email
  async sendMaintenanceEmail(notifcationId: string) {
    try {
      const maintenanceEmail = process.env.MaintenanceEmail;
      const notifcation = await this.prismaService.notification.findUnique({
        where: { id: notifcationId },
      });

      if (
        !notifcation ||
        !notifcation.meta ||
        typeof notifcation.meta !== "object" ||
        Array.isArray(notifcation.meta)
      ) {
        return {
          ok: false,
          error: "There is nothing to send to maintenance or meta is invalid.",
        };
      }

      const meta = notifcation.meta as Record<string, any>;
      const type = meta.type;
      const categores = meta.category;
      const severity = meta.severity;
      const subject = "maintenance issue";
      const messageDeveloper = meta.messageDeveloper;
      const htmlContent = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            background-color: #f4f4f4;
            margin: 0; 
            padding: 20px;
          }
          .container {
            background: white;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
          h1 {
            color: #333;
          }
          h2 {
            color: #555;
          }
          ul {
            list-style-type: none;
            padding: 0;
          }
          li {
            padding: 8px 0;
            border-bottom: 1px solid #ddd;
          }
          .footer {
            margin-top: 20px;
            font-size: 0.9em;
            color: gray;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>maintence help</h1>

          <ul>
            <li><strong>Type:</strong> ${type}</li>
            <li><strong>Category:</strong> ${categores}</li>
            <li><strong>Severity:</strong> ${severity}</li>
            <li><strong>Details:</strong> ${messageDeveloper}</li>
          </ul>

          <div class="footer">
            <p>Best Regards,</p>
          </div>
        </div>
      </body>
    </html>
  `;

      await transporter.sendMail({
        from: `"Your App" <${process.env.ADMIN}>`,
        to: maintenanceEmail,
        subject: subject,
        text: "You have a new maintenance notification. Please check your email for details.",
        html: htmlContent,
      });

      return { ok: true, message: "Maintenance email sent successfully!" };
    } catch (error: any) {
      throw new Error(`SendEmail failed: ${(error as Error).message}`);
    }
  }
  async markReadMessage(id: string) {
    try {
      await this.prismaService.notification.update({
        where: {
          id,
        },
        data: {
          isRead: true,
        },
      });
      return {
        ok: true,
        message: "read completed",
      };
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        message: "smtg thing just happened",
      };
    }
  }
  async sendEmailToManager(
    credentials: ManagerCredentials,
    tournamentName: string,
  ) {
    try {
      const { email, username, temporaryPassword } = credentials;
      const info = await transporter.sendMail({
        from: `"UniLeague Hub" <${process.env.ADMIN}>`,
        to: email,
        subject: `You’ve been assigned as Manager for ${tournamentName}`,
        html: generateManagerEmailHTML({
          email,
          username,
          password: temporaryPassword,
          tournamentName,
        }),
      });

      return {
        success: info.accepted.includes(email),
        message: info.response,
      };
    } catch (error) {
      throw new Error(`SendEmail failed: ${(error as Error).message}`);
    }
  }
  async sendEmailToCoach(credentials: CoachCredentials) {
    try {
      const {
        recipientName,
        teamName,
        tournamentName,
        registrationKey,
        accessKey,
        email,
      } = credentials;
      const info = await transporter.sendMail({
        from: `"UniLeague Hub" <${process.env.ADMIN}>`,
        to: email,
        subject: `Coach's Credential Detail for  ${teamName}`,
        html: generateTeamAccessEmailHTML({
          recipientName,
          teamName,
          tournamentName,
          registrationKey,
          accessKey,
        }),
      });

      return {
        success: info.accepted.includes(email),
        message: info.response,
      };
    } catch (error) {
      throw new Error(`SendEmailToCoach failed: ${(error as Error).message}`);
    }
  }
}
