import { prisma } from "../../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
export class AdminService {
  constructor(private prismaService = prisma) {}

  // creating a player
  async createPlayer(name: string, position:string, number: number, teamId: string){
    try{
      const exists = await this.prismaService.player.findFirst({
        where: {teamId, number},
      });
      if(exists){
        return {
          ok: false,
          error: "Player number already taken in this team"
        };
      }
      const player = await this.prismaService.player.create({
        data:{
          name,
          position,
          number,
          teamId
        },
      });
      return {
        ok: true,
        data: player
      };
    }catch(error: any){
      return {
        ok:false,
        error: error.message
      };
    }
  }


      // getting all players 

  async getPlayers(){
    try{
      const players = await  this.prismaService.findMany({
        include:{team: true}
      });
      return {
        ok: true,
        data: players
      };
    }catch (error: any){
      return {
        ok: false,
        error: error.message
      }
    }
  }

  // get player by id

  async getPlayerById(id: string){
    try{
      const player = await this.prismaService.findUnique({
        where: { id },
        include: {team: true}
      });
      if(!player){
        return {
          ok: false,
          error: "player not found !!!"
        };
      }
      return {
        ok : true,
        data : player
      }
    }catch (error: any){
      return {
        ok: false,
        error: error.message
      }
    }
  }

  // update player
  async updatePlayer(id: string, data: any){
    try{
      if (data.teamId || data.number){
      const player = await this.prismaService.player.findUnique({
        where: { id },
      });

      if (!player){
        return {
          ok: false,
          error: "Player not found!!!"
        };
        
      }
      const exists = await this.prismaService.player.findFirst({
        where: {
          teamId: data.teamId ?? player.teamId,
          number: data.number ?? player.number,
          NOT: { id }
        },
      });

      if (exists){
        return{
          ok: false,
          error: "Another player already has the number change number"
        }
      }
    }

      const updated = await this.prismaService.player.update({
        where: {id},
        data
      });
      return {
        ok: true,
        data: updated
      };
      
      }catch (error: any){
        return {
          ok: false, 
          error: error.message
        };
      }
    }

    // delete players

    async deletePlayer(id: string){
      try{
        const exists = await this.prismaService.player.findUnique({
          where: {id}
        });

        if (!exists){
          return {
            ok: false,
            error: "Player not found !!!"
          };
        }

        await this.prismaService.player.delete({ where: {id }});
        return {
          ok: true,
          data: "Player deleted successfully"
        };

      }catch (error: any){
        return {
          ok: false,
          error: error.message
        };
      }
    }

    // get players by there teams

    async getPlayerByTeam(teamId: string){
      try{
        const players = await this.prismaService.player.findMany({
          where: { teamId},
        });
        return {
          ok: true,
          data: players
        }
      }catch(error: any){
        return {
          ok: false,
          error: error.message
        }
      }
    }

}
