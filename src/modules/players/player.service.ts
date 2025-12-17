import { prisma } from "../../config/db";
import { GalleryService } from "../gallery/gallery.service";

export class PlayerService {
  constructor(
    private prismaService = prisma,
    private galleryService: GalleryService) {}

  // creating a player
  async createPlayer(name: string, position:string, number: number, teamId: string, playerPhoto? : Express.Multer.File){
    try{

      if (!name || !position  || number <=0 || !teamId){
        return {
          ok: false,
          error: "Invalid input parameters!!"
        };
      }

      const teamExists = await this.prismaService.team.findUnique({
        where: {id: teamId }
      });
      if (!teamExists){
        return {
          ok: false,
          error: "This team does not exist!!"
        };
      }


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
      let avatar = null;

      if (playerPhoto){
        avatar = await this.galleryService.savePicture(
          playerPhoto.buffer,
          player.id,
          "PLAYER",
          "AVATAR",
          true
        );   
        
      }
      return {
        ok: true,
        data: {
          ...player,
          avatar
        }
      };
    }catch(error: any){
      return {
        ok:false,
        error: error.message
      };
    }
  }


      // getting all players 

  async getPlayers( teamId:string ){
    try{
      const players = await  this.prismaService.player.findMany({
        where: {teamId},
        include:{team:{select: {teamName: true}}}
      });

      const result = [];
      for (const player of players){
        const avatar = await this.galleryService.getImagesByOwner(
          "PLAYER",
          player.id,
          "AVATAR"
        );

        result.push({
          ...player,
          avatar: avatar.length ? avatar[0].url : null
        })
      }
      
      return {
        ok: true,
        data: result
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

      if (!id) {
        return {
            ok: false,
            error: "Player ID must be provided.",
        };
    }
    
      const player = await this.prismaService.player.findUnique({
        where: { id: id },
        include: {team:{select:{  teamName:true}}},

      });
      if(!player){
        return {
          ok: false,
          error: "player not found !!!"
        };
      }
       
      const status = await this.prismaService.playerMatchStats.aggregate({
        where: {playerId: id},
        _sum: {
          goals: true,
          assists: true,
          yellow: true,
          red: true,
          minutes: true,
        },
      });
      
      const avatar = await this.galleryService.getImagesByOwner(
        "PLAYER",
        id,
        "AVATAR"

      );
      
      return {
        ok: true,
        data: {
          ...player,
          avatar: avatar.length ? avatar[0].url : null,
          totalStatus: {
            goals: status._sum.goals || 0,
            assists: status._sum.assists || 0,
            yellow : status._sum.yellow || 0,
            red: status._sum.red || 0,
            minutes: status._sum.minutes || 0,
          },
        },
      };
      
    }catch (error: any) {
        console.error("Error fetching player by ID:", error); 
        return {
            ok: false,
            error: error.message || "An unexpected error occurred.",
        };
    }
  }

  // update player
  async updatePlayer(id: string, number?: number, name?: string, position?: string, avatar?: Express.Multer.File){
    try{
      if (!id){
        return{
          ok: false,
          error: "player id required"
        }
      };
      
      const player = await this.prismaService.player.findUnique({
        where: { id},
      })

      if (!player){
        return {
          ok: false,
          error: "Player not found!!!"
        };
        
      }

      if (number !== undefined){
      const exists = await this.prismaService.player.findFirst({
        where: {
          number,
          teamId: player.teamId,
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

      const updateData: any= {};
      if(number !== undefined) updateData.number = number;
      if(name !== undefined) updateData.name = name;
      if(position !== undefined) updateData.position = position;

      const updatedplayer = await this.prismaService.player.update({
        where: {id},
        data: updateData,
      });

      
      if (avatar) {
        const existingAvatar = await this.prismaService.mediaGallery.findFirst({
          where: {
            ownerId: id, ownerType: "PLAYER", usage:"AVATAR",isPrimary: true
          },
          select: {
            id: true, publicId: true
          }
        });
        
        await this.galleryService.savePicture(
          avatar.buffer,
          id,
          "PLAYER",
          "AVATAR",
          true
        );

        if (existingAvatar?.publicId){
          await this.galleryService.deleteImage(existingAvatar.publicId);
        }
      }

      return {
        ok: true,
        data: updatedplayer
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
        const existingAvatar = await this.prismaService.mediaGallery.findFirst({
          where: {
            ownerId: id,
            ownerType: "PLAYER",
            usage: "AVATAR",
            isPrimary: true
          },
          select: {publicId: true}
        })
        if (existingAvatar?.publicId){
          try{

            await this.galleryService.deleteImage(existingAvatar.publicId)
          }catch (deleteError){
            console.log("error deleting avatar", deleteError)
          }
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

    // search player by name
  async searchPlayerByName(name: string) {
    try {
        console.log("Received name:", name);
        const fineName = name.trim();
        if (!fineName) {
            return {
                ok: false,
                error: "Player name cannot be empty.",
            };
        }
        const players = await this.prismaService.player.findMany({
            where: {
                name: {
                    contains: fineName,
                    mode: 'insensitive',
                },
            },
            include: {
                team: {
                   select: {
                     teamName: true } },
            },
        });
        if (players.length === 0) {
            return {
                ok: false,
                error: "Player not found.",
            };
        }
        const result = await Promise.all(players.map(async (player) => {
            const avatar = await this.galleryService.getImagesByOwner(
                "PLAYER",
                player.id,
                "AVATAR"
            );
            return {
                ...player,
                avatar: avatar.length ? avatar[0].url : null 
            };
        }));

        return {
            ok: true,
            data: result,
        };
    } catch (error: any) {
        console.error("Error searching for player:", error);
        return {
            ok: false,
            error: error.message || "An unexpected error occurred.",
        };
    }
}

    // player transfer

    async playerTransfer(playerId: string, newTeamId: string, newNumber: number){

      try{
        if (!playerId || !newTeamId || newNumber < 0){
          return{
            ok: false,
            error: "invalid input check again!"
          }
        }

        const checkPlayer = await this.prismaService.player.findUnique({
          where: {id: playerId}
        });
        if (!checkPlayer){
          return {
            
            ok: false,
            error: "player does not exist"
          }
        }

        const checkTeam = await this.prismaService.team.findUnique({
          where:{id: newTeamId}
        });
        
        if(!checkTeam) {
          return {
            ok: false,
            error: "the new team does not exist"
          }
        }
        const checkNumber = await this.prismaService.player.findMany({
          where: {
            number: newNumber,
            teamId: newTeamId
          }
        });
        if (checkNumber.length > 0){
          return {
            ok: false,
            error: "the number is taken by other player in the team"
          }
        }

        if (checkPlayer.teamId === newTeamId){
          return {
            ok: false,
            error: "transfer to same team is not allowed"
          }
        }

        const transferPlayer = await this.prismaService.player.update({
          where: { id: playerId},
          data: {
            teamId: newTeamId,
            number: newNumber
          }
        });

        return {
          ok: true,
          data: transferPlayer
        }
      }catch (error: any){
        return {
          ok: false,
          error: error.message
        }
      }

    }

}
