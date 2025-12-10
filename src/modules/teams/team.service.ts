import { prisma } from "../../config/db";
export class TeamService {
  constructor(private PrismaService= prisma) {}

  // create team
  async createTeam(teamName: string, logo: string){

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
      //logo need to be stored in the cloudnary and the url is going to saved need fucntion to store the image and it retunr the public url of that image 
      
      const team = await this.PrismaService.team.create({
        data: {
          teamName,
          logo
        }
      });
      return {
        ok: true,
        data: team
      }
    }catch (error: any){
      return {
        ok: false,
        error: error.message
      };
    }
  }

  // update team
  async updateTeam(id: string, data: any){

    try {
      if (!id) {
        return {
          ok: false,
          error: "invalid parameter"
        };
      };
      //any should be avoidid plus the update need to be safe 
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




}