"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerControl = void 0;
const ApiResponse_1 = require("../../common/utils/ApiResponse");
const player_service_1 = require("./player.service");
const gallery_service_1 = require("../gallery/gallery.service");
const db_config_1 = require("../../config/db.config");
const gallery = new gallery_service_1.GalleryService();
const playerService = new player_service_1.PlayerService(db_config_1.prisma, gallery);
class PlayerControl {
    // create a player
    static async createPlayer(req, res) {
        const { name, position, number, teamId } = req.body;
        const playerPhoto = req.file;
        const values = await playerService.createPlayer(name, position, Number(number), teamId, playerPhoto);
        if (!values.ok) {
            return res
                .status(400)
                .json(new ApiResponse_1.ApiResponseBuilder().badRequest(values.error).build(res));
        }
        return res
            .status(201)
            .json(new ApiResponse_1.ApiResponseBuilder()
            .created("player created")
            .withData(values.data)
            .build(res));
    }
    // Get all players
    static async getPlayers(req, res) {
        const { teamId } = req.params;
        const values = await playerService.getPlayers(teamId);
        if (!values.ok) {
            return res
                .status(400)
                .json(new ApiResponse_1.ApiResponseBuilder().badRequest(values.error).build(res));
        }
        return res
            .status(200)
            .json(new ApiResponse_1.ApiResponseBuilder()
            .ok("players fetched")
            .withData(values.data)
            .build(res));
    }
    // Get player by Id
    static async getPlayerById(req, res) {
        const { id } = req.params;
        const value = await playerService.getPlayerById(id);
        if (!value.ok) {
            return res
                .status(404)
                .json(new ApiResponse_1.ApiResponseBuilder().notFound(value.error).build(res));
        }
        return res
            .status(200)
            .json(new ApiResponse_1.ApiResponseBuilder()
            .ok("player found")
            .withData(value.data)
            .build(res));
    }
    // get player by it's name
    static async getPlayerByName(req, res) {
        const { name } = req.params;
        const playerName = await playerService.searchPlayerByName(name);
        if (!playerName.ok) {
            return res
                .status(404)
                .json(new ApiResponse_1.ApiResponseBuilder().notFound(playerName.error).build(res));
        }
        return res
            .status(200)
            .json(new ApiResponse_1.ApiResponseBuilder()
            .created("player found")
            .withData(playerName.data)
            .build(res));
    }
    static async transferPlayer(req, res) {
        const { playerId, newTeamId, newNumber, managerId, tournamentId } = req.body;
        if (!playerId || !newTeamId || typeof newNumber !== "number") {
            return res
                .status(400)
                .json(new ApiResponse_1.ApiResponseBuilder()
                .badRequest("Provide playerId, newTeamId, and newNumber")
                .build(res));
        }
        const result = await playerService.playerTransfer(playerId, newTeamId, newNumber, tournamentId, managerId);
        if (!result.ok) {
            return res
                .status(400)
                .json(new ApiResponse_1.ApiResponseBuilder().badRequest(result.error).build(res));
        }
        return res
            .status(200)
            .json(new ApiResponse_1.ApiResponseBuilder()
            .ok("Player transferred successfully")
            .withData(result.data)
            .build(res));
    }
    static async deletePlayer(req, res) {
        const { id } = req.params;
        const playerName = await playerService.deletePlayer(id);
        if (!playerName.ok) {
            return new ApiResponse_1.ApiResponseBuilder().notFound(playerName.error).build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .created("player deleted")
            .withData(playerName.data)
            .build(res);
    }
}
exports.PlayerControl = PlayerControl;
