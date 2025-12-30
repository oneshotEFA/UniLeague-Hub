import { Request, Response } from 'express';
import { ApiResponseBuilder } from '../../common/utils/ApiResponse';
import { NotificationService } from '../notifications/notification.servie';
import { AdminService } from './admin.service';
import { prisma } from '../../config/db.config';
import { GalleryService } from '../gallery/gallery.service';
import { TournamentService } from '../tournaments/tournament.service';

const gallery = new GalleryService();
const tournament = new TournamentService(prisma, gallery);
const notificationService = new NotificationService(prisma, gallery);
const adminService = new AdminService(prisma, tournament, notificationService);

export class AdminControl {
  static async createTournament(req: Request, res: Response) {
    try {
      // Check if the logo file is provided
      if (!req.file) {
        return res
          .status(400)
          .json(
            new ApiResponseBuilder()
              .badRequest('Logo file is required')
              .build(res)
          );
      }
      const createTournament = await tournament.createTournament({ ...req.body, logo: req.file });

      if (!createTournament.ok) {
        return res
          .status(400)
          .json(
            new ApiResponseBuilder()
              .badRequest(createTournament.error)
              .build(res)
          );
      }

      return res
        .status(201)
        .json(
          new ApiResponseBuilder()
            .created('Tournament created successfully')
            .withData(createTournament.data)
            .build(res)
        );
    } catch (err) {
      console.error('Error during tournament creation:', err);
      return res
        .status(500)
        .json(
          new ApiResponseBuilder().internalError('Server error').build(res)
        );
    }
  }

  // upadate the torunament
  static async updateTournament(req: Request, res: Response) {
    const update = await adminService.updateTournament(req.body);
    if (!update.ok) {
      return res
        .status(400)
        .json(new ApiResponseBuilder().badRequest(update.error).build(res));
    }
    return res
      .status(200)
      .json(
        new ApiResponseBuilder()
          .created('updated')
          .withData(update.data)
          .build(res)
      );
  }

  // delete tournamemnt

  static async deleteTournament(req: Request, res: Response) {
    const id = req.params.id;
    const deleted = await adminService.deleteTournament(id);
    if (!deleted.ok) {
      return res
        .status(400)
        .json(new ApiResponseBuilder().badRequest(deleted.error).build(res));
    }
    return res
      .status(200)
      .json(
        new ApiResponseBuilder()
          .created('tournament deleted')
          .withData(deleted.data)
          .build(res)
      );
  }

  // delete admin

  static async deletedAdmin(req: Request, res: Response) {
    const id = req.params.id;
    const deleted = await adminService.deleteAdmin(id);
    if (!deleted.ok) {
      return res
        .status(400)
        .json(new ApiResponseBuilder().badRequest(deleted.error).build(res));
    }
    return res
      .status(200)
      .json(
        new ApiResponseBuilder()
          .created('admin deleted')
          .withData(deleted)
          .build(res)
      );
  }
  // get tournamet teams
  static async getTeamsInTournament(req: Request, res: Response) {
    const id = req.params.id;
    const teams = await adminService.getTeamsInTournament(id);
    if (!teams.ok) {
      return res
        .status(400)
        .json(new ApiResponseBuilder().badRequest(teams.error).build(res));
    }
    return res
      .status(200)
      .json(
        new ApiResponseBuilder()
          .created('tournament teams')
          .withData(teams.data)
          .build(res)
      );
  }

  //assign manager to tournament

  static async assignManagerToTournament(req: Request, res: Response) {
    const id = req.params.id;
    const tournament = req.params.Id;

    const manager = await adminService.assignManagerToTournament(
      id,
      tournament
    );
    if (!manager.ok) {
      return res
        .status(400)
        .json(new ApiResponseBuilder().badRequest(manager.error).build(res));
    }
    return res
      .status(200)
      .json(
        new ApiResponseBuilder()
          .created('manager assigned')
          .withData(manager.data)
          .build(res)
      );
  }

  // get tournament managers
  static async getTournamentManagers(req: Request, res: Response) {
    const managers = await adminService.getTournamentManagers();
    if (!managers.ok) {
      return res
        .status(400)
        .json(new ApiResponseBuilder().badRequest(managers.error).build(res));
    }
    return res
      .status(200)
      .json(
        new ApiResponseBuilder()
          .created('tournamnet manager')
          .withData(managers.data)
          .build(res)
      );
  }

  // remove Tournament Manager
  static async removeTournamentManager(req: Request, res: Response) {
    const { tournamentId, managerId } = req.params;

    const removeManager = await adminService.removeTournamentManager(
      tournamentId,
      managerId
    );
    if (!removeManager.ok) {
      return res
        .status(400)
        .json(
          new ApiResponseBuilder().badRequest(removeManager.error).build(res)
        );
    }
    return res
      .status(200)
      .json(
        new ApiResponseBuilder()
          .created('manager removed')
          .withData(removeManager)
          .build(res)
      );
  }

  // get  All Admin
  static async getAllAdmin(req: Request, res: Response) {
    const admins = await adminService.getAllAdmin();
    if (!admins.ok) {
      return res
        .status(400)
        .json(new ApiResponseBuilder().badRequest(admins.error).build(res));
    }
    return res
      .status(200)
      .json(
        new ApiResponseBuilder()
          .created('all admins')
          .withData(admins.data)
          .build(res)
      );
  }

  // create news
  static async createNews(req: Request, res: Response) {
    const data = req.body;
    const image = req.file;

    const removeManager = await adminService.createNews(data, image);
    if (!removeManager.ok) {
      return res
        .status(400)
        .json(
          new ApiResponseBuilder().badRequest(removeManager.error).build(res)
        );
    }
    return res
      .status(200)
      .json(
        new ApiResponseBuilder()
          .created('news is created')
          .withData(removeManager.data)
          .build(res)
      );
  }

  // update news
  static async updateNews(req: Request, res: Response) {
    const newsId = req.params.id;
    const content = req.body;

    const updated = await adminService.updateNews(newsId, content);
    if (!updated.ok) {
      return res
        .status(400)
        .json(new ApiResponseBuilder().badRequest(updated.error).build(res));
    }
    return res
      .status(200)
      .json(
        new ApiResponseBuilder()
          .created('updated')
          .withData(updated.data)
          .build(res)
      );
  }

  // delete news
  static async deleteNews(req: Request, res: Response) {
    const newsId = req.params.id;

    const deleted = await adminService.deleteNews(newsId);
    if (!deleted.ok) {
      return res
        .status(400)
        .json(new ApiResponseBuilder().badRequest(deleted.error).build(res));
    }
    return res
      .status(200)
      .json(
        new ApiResponseBuilder()
          .created('deleted')
          .withData(deleted.data)
          .build(res)
      );
  }

  // all admins
  static async getAllNews(req: Request, res: Response) {
    const managers = await adminService.getAllAdmin();
    if (!managers.ok) {
      return res
        .status(400)
        .json(new ApiResponseBuilder().badRequest(managers.error).build(res));
    }
    return res
      .status(200)
      .json(
        new ApiResponseBuilder()
          .created('managers')
          .withData(managers.data)
          .build(res)
      );
  }

  // system logs
  static async getsystemLogs(req: Request, res: Response) {
    const logs = await adminService.systemLogs();
    if (!logs.ok) {
      return res
        .status(400)
        .json(new ApiResponseBuilder().badRequest(logs.error).build(res));
    }
    return res
      .status(200)
      .json(
        new ApiResponseBuilder()
          .created('system logs')
          .withData(logs.data)
          .build(res)
      );
  }
}
