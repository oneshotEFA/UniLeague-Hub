"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
const cloudinary_config_1 = __importDefault(require("../../config/cloudinary.config"));
class CloudinaryService {
    // upload to cloudinary
    async upload(buffer, folderName) {
        return new Promise((resolve, reject) => {
            cloudinary_config_1.default.uploader
                .upload_stream({
                folder: folderName
            }, (error, result) => {
                if (error)
                    return reject(error);
                resolve(result.secure_url);
            })
                .end(buffer);
        });
    }
}
exports.CloudinaryService = CloudinaryService;
