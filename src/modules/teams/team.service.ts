import { Prisma } from "../../../generated/prisma";
import { prisma } from "../../config/db";
import { CloudinaryService } from "../../common/constants/cloudinary";
import { GalleryService } from "../gallery/gallery.service"
export class TeamService {
  constructor(
    private PrismaService= prisma,
    private cloudinaryService: CloudinaryService,
    private galleryService: GalleryService
  ) {}

  // upload image(logo) to the cloudinary cloud create team
  async createTeam(teamName: string, logo: Express.Multer.File){
    
    try{
      if ( !teamName || !logo ){
        return {  
          ok: false,
          error: "Team name and logo is required"
        };
      }
      const check = await this.PrismaService.team.findMany({
        where: {teamName}
      });
      if (check.length > 0){
        return {
          ok: false,
          error: "there is a team with this name!!!"
        }
      }
      
      const team = await this.PrismaService.team.create({
        data: {
          teamName
        }
      });

      const logoSaved = await this.galleryService.savePicture(
        logo.buffer,
        team.id,
        "TEAM",
        "LOGO",
        true
      );

      return {
        ok: true,
        data: {
          team, 
          logo: logoSaved.data?.url
        }
      }
    }catch (error: any){
      return {
        ok: false,
        error: error.message
      };
    }
  }

  // update team
  async updateTeam(id: string, data: Prisma.TeamUpdateInput, logo: Express.Multer.File){

    try {
      if (!id) {
        return {
          ok: false,
          error: "invalid parameter"
        };
      };
      
      const update = await this.PrismaService.team.update({
        where: {id},
        data
      });

      return {
        ok: true,
        data: update
      }
    }catch(error: any){
      return {
        ok: false,
        error: error.message
      }
    }

  }


  // remove team
  async removeTeam(id: string){
    try{
      const  team = await this.PrismaService.team.findUnique({
        where: { id }
      });
      if (!team){
        return {
          ok: false,
          error: "team does not exist"
        }
      }
      const removedTeam = await this.PrismaService.team.delete({
        where: {id}
      });
      return {
        ok: true,
        data: removedTeam
      }
    }catch (error: any){
      return {
        ok: false,
        error: error.message
      }
    }
  }


  // search team 
  async searchTeamByName(teamName: string){
    const fineName = teamName.trim();
    try{
      if (!fineName){
        return {
          ok: false,
          error: "team name required"
        };
      };
      const search = await this.PrismaService.team.findMany({
        where: {teamName:{
          contains: fineName,
           mode: "insensitive"
          }}
      });
      return {
        ok: true,
        data: search
      };
    }catch (error: any){
      return {
        ok: false,
        error: error.message
      }
    }
  }

  // get team be Id

  async getTeamById(id: string){

    try{
      if (!id){
        return{
          ok: false,
          error: "id requierd"
        }
      }
      const check = await this.PrismaService.team.findUnique({
        where: { id }
      });
      if (!check){
        return{
          ok: false,
          error: "no team found"
        }
      }
      const getTeam = await this.PrismaService.team.findUnique({
        where: { id }
      });
      return {
        ok: true,
        data: getTeam
      }
    }catch (error: any){
      return {
        ok: false,
        error: error.message
      }
    }
  }

  // team stastics
  async teamStatus(id: string){
    try{
    if (!id) {
      return {
        ok: false,
        error: "teamid is required"
      }
    }
    const check = await this.PrismaService.team.findUnique({
      where: {id: id}
    });
    if (!check){
      return {
        ok: false,
        error: "team does not exist"
      }
    }
    const matches = await this.PrismaService.match.findMany({
      where: {
        status: "FINISHED",
        OR: [
          { homeTeamId: id},
          { awayTeamId: id}
        ]
      }
    });

    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;

    for (const match of matches) {
      const home = match.homeTeamId === id;

      const scored = home ? match.homeScore : match.awayScore;
      const conceded = home ? match.awayScore: match.homeScore;

      goalsFor += scored;
      goalsAgainst += conceded;

      if (scored > conceded){
        wins ++;
      }
      else if (scored === conceded){
        draws ++;
      }
      else {
        losses ++;
      }

    }

    const cards = await this.PrismaService.matchEvent.groupBy({
      by: ["eventType"],
      where: {
        eventTeamId: id,
        eventType: {in: ["Yellow", "Red"]}
      },
      _count: true
    })

    const yellowCards = cards.find(check => check.eventType ==="Yellow")?._count ?? 0;
    const readCards = cards.find(check => check.eventType === "Red")?._count ?? 0; 

    return {
      ok: true,
      data: {
        id,
        teamName: check.teamName,
        matchesPlayed: matches.length,
        wins,
        draws,
        losses,
        goalsFor,
        goalsAgainst,
        goalDifference: goalsFor - goalsAgainst,
        yellowCards,
        readCards
      }
    };

  }catch(error: any){
    return {
      ok: false,
      error: error.message
    };
  }

  }

  
}