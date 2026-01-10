import { prisma } from "../../config/db.config";
import { TournamentService } from "../tournaments/tournament.service";
import { tournament } from "../tournaments/utility";
import { UpdateTournament } from "../tournaments/utility";
import { NotificationService } from "../notifications/notification.servie";
import { AuthService } from "../auth/auth.service";
import { generatePassword } from "./utility";

interface NewsContent {
  type: string;
  content: string;
  title: string;
}

interface UpdateNews {
  type?: string;
  message?: string;
  title?: string;
  body?: string;
  category?: string;
  image?: Express.Multer.File;
}
export class AdminService {
  constructor(
    private prismaService = prisma,
    private tournamentService: TournamentService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  // create a tournament
  async createTournament(data: tournament) {
    try {
      if (!data) {
        return {
          ok: false,
          error: "data required",
        };
      }
      const tournament = await this.tournamentService.createTournament(data);
      return {
        ok: true,
        data: tournament,
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "unexpected error",
      };
    }
  }

  // update a tournament
  async updateTournament(data: UpdateTournament) {
    try {
      if (!data) {
        return {
          ok: false,
          error: "data required",
        };
      }
      const update = await this.tournamentService.updateTournament(data);
      return {
        ok: true,
        data: update,
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "unexpected error",
      };
    }
  }

  // deleting tournament
  async deleteTournament(id: string) {
    try {
      if (!id) {
        return {
          ok: false,
          error: "id is required",
        };
      }
      const deletedTournament = await this.tournamentService.deleteTournament(
        id
      );
      return {
        ok: true,
        data: deletedTournament,
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "unexpected error",
      };
    }
  }

  // delete admin
  async deleteAdmin(adminId: string) {
    try {
      if (!adminId) {
        return {
          ok: false,
          error: "Admin ID is required",
        };
      }

      const admin = await this.prismaService.admin.findUnique({
        where: { id: adminId },
      });

      if (!admin) {
        return {
          ok: false,
          error: "No admin found with this ID",
        };
      }

      await this.prismaService.admin.delete({
        where: { id: adminId },
      });

      return {
        ok: true,
        message: "Admin deleted successfully",
      };
    } catch (error: any) {
      return {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      };
    }
  }

  // get the teams in the tournament
  async getTeamsInTournament(tournamentId: string) {
    try {
      if (!tournamentId) {
        return {
          ok: false,
          error: "tournament id is required",
        };
      }
      const teams = await this.tournamentService.getTournamentTeams(
        tournamentId
      );
      return {
        ok: true,
        data: teams,
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "unexpected error",
      };
    }
  }

  // assing manager to tournament
  async assignManagerToTournament(managerId: string, tournamentId: string) {
    try {
      if (!managerId || !tournamentId) {
        return {
          ok: false,
          error: "Both id is required",
        };
      }
      const tournament = await this.prismaService.tournament.findUnique({
        where: { id: tournamentId },
      });

      if (!tournament) {
        return {
          ok: false,
          error: "no tournament by this id",
        };
      }
      const manager = await this.prismaService.admin.findUnique({
        where: { id: managerId },
      });
      if (!manager) {
        return {
          ok: false,
          error: "no manager in this",
        };
      }
      const assignManager = await this.prismaService.tournament.update({
        where: { id: tournamentId },
        data: { managerId: managerId },
      });

      return {
        ok: true,
        data: assignManager,
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "unexpected error",
      };
    }
  }

  // get tournament manager
  async getTournamentManagers() {
    try {
      const managers = await this.prismaService.admin.findMany({
        where: { role: "tournamentManager" },
        include: {
          tournaments: true,
        },
      });
      return {
        ok: true,
        data: managers,
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "unexpected error",
      };
    }
  }

  // remove tournament manager
  async removeTournamentManager(tournamentId: string, managerId: string) {
    try {
      if (!tournamentId || !managerId) {
        return {
          ok: false,
          error: "Both id is required",
        };
      }
      const tournament = await this.prismaService.tournament.findUnique({
        where: { id: tournamentId },
      });

      if (!tournament) {
        return {
          ok: false,
          error: "no tournament by this id",
        };
      }

      const manager = await this.prismaService.admin.findUnique({
        where: { id: managerId },
      });

      if (!manager) {
        return {
          ok: false,
          error: "no manager in this",
        };
      }
      const removed = await this.prismaService.tournament.update({
        where: { id: tournamentId },
        data: { managerId: null },
      });
      return {
        ok: true,
        message: "manager removed successfully",
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "unexpected error",
      };
    }
  }

  // get all admin
  async getAllAdmin() {
    try {
      const allAdmin = await this.prismaService.admin.findMany({
        where: { role: "tournamentManager" },
      });

      return {
        ok: true,
        count: allAdmin.length,
        data: allAdmin,
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  // creating news
  async createNews(
    content: {
      content: string;
      title: string;
      excerpt: string;
      adminId: string;
    },
    image?: Express.Multer.File
  ) {
    // console.log(content);
    try {
      if (!content.excerpt || !content.title || !content.content) {
        return {
          ok: false,
          error: "each content is requierd",
        };
      }
      const news = await this.notificationService.broadCastToWeb(
        content,
        image
      );

      if (!news.ok) {
        return {
          ok: false,
          error: news.error,
        };
      }

      return {
        ok: true,
        data: news,
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  // update news
  async updateNews(newsId: string, content: UpdateNews) {
    try {
      if (!newsId) {
        return {
          ok: false,
          error: "news id is requierd",
        };
      }
      const update = await this.notificationService.updateBroadCast(
        newsId,
        content
      );
      if (!update.ok) {
        return {
          ok: false,
          error: update.error,
        };
      }
      return {
        ok: true,
        data: update,
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  // delete news
  async deleteNews(newsId: string) {
    try {
      if (!newsId) {
        return {
          ok: false,
          error: "news id is requierd",
        };
      }
      const deletedNews = await this.notificationService.deleteBroadCast(
        newsId
      );

      if (!deletedNews.ok) {
        return {
          ok: false,
          error: deletedNews.error,
        };
      }
      return {
        ok: true,
        data: deletedNews,
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  // get all news
  async getAllNews() {
    try {
      const allNews = await this.notificationService.getBroadCastNotification();
      if (!allNews.ok) {
        return {
          ok: false,
          error: allNews.error,
        };
      }
      return {
        ok: true,
        data: allNews.data,
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  // get all system logs
  async systemLogs() {
    try {
      const logs = await this.notificationService.getSystemCalls();
      if (!logs.ok) {
        return {
          ok: false,
          error: logs.error,
        };
      }
      return {
        ok: true,
        data: logs,
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }
  async getAllMessageMeta(): Promise<{
    ok: boolean;
    message: string;
    data:
      | {
          senderId: string;
          senderName: string;
          tournamentName: string;
          lastMessage: string;
          lastMessageAt: Date;
        }[]
      | null;
  }> {
    const admin = await this.prismaService.admin.findFirst({
      where: { role: "superAdmin" },
    });

    if (!admin) {
      return {
        ok: false,
        message: "No super admin found",
        data: null,
      };
    }
    const messages = await this.prismaService.notification.findMany({
      where: {
        OR: [{ receiverAdminId: admin.id }, { senderAdminId: admin.id }],
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        message: true,
        createdAt: true,
        sender: {
          select: {
            id: true,
            fullName: true,
            tournaments: {
              select: {
                id: true,
                tournamentName: true,
              },
            },
          },
        },
      },
    });
    const conversationsMap = new Map<
      string,
      {
        senderId: string;
        senderName: string;
        tournamentName: string;
        lastMessage: string;
        lastMessageAt: Date;
      }
    >();
    for (const msg of messages) {
      const sender = msg.sender;
      if (!sender) continue;
      const senderId = sender.id;
      const tournament = sender.tournaments[0]; // assuming 1 active tournament
      const key = `${senderId}-${tournament?.id ?? "no-tournament"}`;
      if (!conversationsMap.has(key)) {
        conversationsMap.set(key, {
          senderId,
          senderName: sender.fullName,
          tournamentName: tournament?.tournamentName ?? "N/A",
          lastMessage: msg.message ?? "",
          lastMessageAt: msg.createdAt,
        });
      }
    }
    const meta = Array.from(conversationsMap.values());
    if (meta.length === 0) {
      return {
        ok: true,
        message: "No messages found",
        data: [],
      };
    }
    return {
      ok: true,
      message: "Message meta fetched successfully",
      data: meta.filter((m) => m.senderId != admin.id),
    };
  }
  async getMessageOfAdmin(clientId: string) {
    const res = await this.notificationService.getAdminNotification(clientId);
    if (!res) {
      return {
        ok: false,
        message: "no resposne from the api or smtg went wrong",
      };
    }
    if (!res.ok) {
      return {
        ok: false,
        message: res.error,
      };
    }
    return {
      ok: true,
      data: res.data,
    };
  }
  async sendDirectMessage(clientId: string, message: string) {
    const admin = await this.prismaService.admin.findFirst({
      where: { role: "superAdmin" },
      select: { id: true },
    });
    if (!admin) {
      return {
        ok: false,
        message: "no admin found",
      };
    }
    const res = await this.notificationService.sendNotification(
      admin.id,
      message,
      clientId
    );
    if (!res) {
      return {
        ok: false,
        message: "no resposne form th api",
      };
    }
    if (!res.ok) {
      return {
        ok: false,
        message: res.error,
      };
    }
    return {
      ok: true,
      message: "i thin it is send buddy",
    };
  }
  async markRead(id: string) {
    return await this.notificationService.markReadMessage(id);
  }
  async createManager(username: string, fullName: string, email: string) {
    const password = generatePassword.toString();
    const res = await this.authService.signup(
      username,
      fullName,
      email,
      password
    );
    if (!res) {
      return {
        ok: false,
        message: "i have no idea why this happen to u",
      };
    }
    if (!res.ok) {
      return {
        ok: false,
        message: res.error,
      };
    }
    return {
      ok: true,
      data: { password, managerId: res.data?.id },
    };
  }
}
