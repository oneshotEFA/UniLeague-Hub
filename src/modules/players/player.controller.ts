import { Request, Response } from "express";
import { ApiResponseBuilder } from "../../common/utils/ApiResponse";
import { PlayerService } from "./player.service";

const playerService = new PlayerService();

export class PlayerControl{
    // create a player
    static async createPlayer(req: Request ,res: Response){
        const {name, position, number,teamId} = req.body;

        const values = await playerService.createPlayer(
            name,
            position,
            number,
            teamId
        );

        if(!values.ok) {
            return res
            .status(400)
            .json(new ApiResponseBuilder().badRequest(values.error).build(res))
        }

        return res
        .status(200)
        .json(
            new ApiResponseBuilder()
            .created("player created")
            .withData(values.data)
            .build(res)
        )
    
    }
    

    // Get all players
    static async getPlayers(res: Response, req: Request){
        const values = await playerService.getPlayers();

        if (!values.ok) {
            return res
            .status(400)
            .json(new ApiResponseBuilder().badRequest(values.error).build(res));
        }
        return res
        .status(201)
        .json(
            new ApiResponseBuilder()
            .ok("players fetched")
            .withData(values.data)
            .build(res)
        )
    }

    // Get player by Id
        
        static async getPlayerById(req: Request, res: Response){
            const { id } = req.params;

            const value = await playerService.getPlayerById( id );

            if (!value.ok){
                return res
                .status(404)
                .json(
                    new ApiResponseBuilder()
                    .notFound(value.error)
                    .build(res)
                );
            }
            return res
            .status(201)
            .json(
                new ApiResponseBuilder()
                .ok("player found")
                .withData(value.data)
                .build(res)
            )
        }
    // get player by it's name

    static async getPlayerByName(req: Request, res: Response){
        const { name } = req.body;
        const playerName = await playerService.searchPlayerByName(name);
        if (!playerName.ok){
            return res
            .status(400)
            .json(
                new ApiResponseBuilder()
                .notFound(playerName.error)
                .build(res)
            )
        }
        return res
        .status(201)
        .json(
            new ApiResponseBuilder()
            .created("player found")
            .withData(playerName.data)
            .build(res)
        )
    }
        
}