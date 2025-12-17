import { TeamService } from "./team.service";
import { CloudinaryService } from "../../common/constants/cloudinary";
import { Request, Response } from "express";
import { ApiResponseBuilder } from "../../common/utils/ApiResponse";
import { prisma } from "../../config/db";
import { GalleryService } from "../gallery/gallery.service";

const gallery = new GalleryService();

const teamService = new TeamService(prisma, gallery);

export class teamControl {
  // create a team
  static async createTeam(req: Request, res: Response) {
    const { teamName } = req.body;
    const logo = req.file;

    const value = await teamService.createTeam(teamName, logo!);

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
}
