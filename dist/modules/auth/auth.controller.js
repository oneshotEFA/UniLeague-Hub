"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const ApiResponse_1 = require("../../common/utils/ApiResponse");
const auth_service_1 = require("./auth.service");
const authService = new auth_service_1.AuthService();
class AuthController {
    static async signup(req, res) {
        const { username, fullName, email, password } = req.body;
        const result = await authService.signup(username, fullName, email, password);
        if (!result.ok) {
            return new ApiResponse_1.ApiResponseBuilder().badRequest(result.error).build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .created("User created")
            .withData(result.data)
            .build(res);
    }
    static async login(req, res) {
        const { username, password } = req.body;
        const result = await authService.login(username, password);
        if (!result.ok) {
            return new ApiResponse_1.ApiResponseBuilder().badRequest(result.error).build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .created("login successful")
            .withData(result.data)
            .build(res);
    }
    static async changePassword(req, res) {
        const { username, currentPassword, newPassword } = req.body;
        const result = await authService.changePassword(username, currentPassword, newPassword);
        if (!result.ok) {
            return new ApiResponse_1.ApiResponseBuilder().badRequest(result.error).build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .created("change was successful")
            .withData(result.data)
            .build(res);
    }
    static async updateUser(req, res) {
        const { id, data } = req.body;
        const result = await authService.updateUser(id, data);
        if (!result.ok) {
            return new ApiResponse_1.ApiResponseBuilder().badRequest(result.error).build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .created("updated")
            .withData(result.data)
            .build(res);
    }
    static async getMe(req, res) {
        const { id } = req.params;
        const result = await authService.getMe(id);
        if (!result.ok) {
            return new ApiResponse_1.ApiResponseBuilder().badRequest(result.error).build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .created("get em")
            .withData(result.data)
            .build(res);
    }
    static async authPlayer(req, res) {
        const { key } = req.body;
        const result = await authService.authPlayerRegistration(key);
        if (!result.ok) {
            return new ApiResponse_1.ApiResponseBuilder().badRequest(result.message).build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .created("get em")
            .withData(result.data)
            .build(res);
    }
}
exports.AuthController = AuthController;
