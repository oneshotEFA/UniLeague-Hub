import { TeamService } from "./team.service";
import { GalleryService } from "../gallery/gallery.service";
import { Request, Response } from "express";
import { ApiResponseBuilder } from "../../common/utils/ApiResponse";
import { prisma } from "../../config/db.config";

const gallery = new GalleryService();
const teamService = new TeamService(prisma, gallery);

export class teamControl {
  // create a team
  static async createTeam(req: Request, res: Response) {
    const { teamName, coachEmail, coachName } = req.body;
    const logo = req.file;

    const value = await teamService.createTeam(
      teamName,
      coachName,
      coachEmail,
      logo!
    );

    if (!value.ok) {
      return res
        .status(401)
        .json(new ApiResponseBuilder().badRequest(value.error).build(res));
    }
    return res
      .status(201)
      .json(
        new ApiResponseBuilder()
          .created("team created")
          .withData(value.data)
          .build(res)
      );
  }

  // get all teams
  static async getTeams(req: Request, res: Response) {
    const value = await teamService.getAllTeams(); // add this method in service if missing
    if (!value.ok) {
      return res
        .status(400)
        .json(new ApiResponseBuilder().badRequest(value.error).build(res));
    }
    return res
      .status(200)
      .json(
        new ApiResponseBuilder()
          .ok("teams fetched")
          .withData(value.data)
          .build(res)
      );
  }

  // get team by id
  static async getTeamById(req: Request, res: Response) {
    const { id } = req.params;
    const value = await teamService.getTeamById(id);
    if (!value.ok) {
      return res
        .status(404)
        .json(new ApiResponseBuilder().notFound(value.error).build(res));
    }
    return res
      .status(200)
      .json(
        new ApiResponseBuilder()
          .ok("team found")
          .withData(value.data)
          .build(res)
      );
  }

  // update team
  static async updateTeam(req: Request, res: Response) {
    const { id } = req.params;
    const data = req.body;
    const logo = req.file;
    const value = await teamService.updateTeam(id, data, logo);
    if (!value.ok) {
      return res
        .status(400)
        .json(new ApiResponseBuilder().badRequest(value.error).build(res));
    }
    return res
      .status(200)
      .json(
        new ApiResponseBuilder()
          .ok("team updated")
          .withData(value.data)
          .build(res)
      );
  }

  // delete team
  static async removeTeam(req: Request, res: Response) {
    const { id } = req.params;
    const value = await teamService.removeTeam(id);
    if (!value.ok) {
      return res
        .status(400)
        .json(new ApiResponseBuilder().badRequest(value.error).build(res));
    }
    return res
      .status(200)
      .json(
        new ApiResponseBuilder()
          .ok("team removed")
          .withData(value.data)
          .build(res)
      );
  }

  // search team by name
  static async searchTeam(req: Request, res: Response) {
    const { name } = req.params;
    const value = await teamService.searchTeamByName(name);
    if (!value.ok) {
      return res
        .status(404)
        .json(new ApiResponseBuilder().notFound(value.error).build(res));
    }
    return res
      .status(200)
      .json(
        new ApiResponseBuilder()
          .ok("team found")
          .withData(value.data)
          .build(res)
      );
  }

  // team status
  static async teamStatus(req: Request, res: Response) {
    const { id } = req.params;
    const value = await teamService.teamStatus(id);
    if (!value.ok) {
      return res
        .status(400)
        .json(new ApiResponseBuilder().badRequest(value.error).build(res));
    }
    return res
      .status(200)
      .json(
        new ApiResponseBuilder()
          .ok("team status")
          .withData(value.data)
          .build(res)
      );
  }
}
