import cloudinary from "../../config/cloudinary.config";


export class CloudinaryService {
    // upload to cloudinary
  async upload(buffer: Buffer, folderName: string): Promise<string> {
    
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({
            folder: folderName
        },
          (error, result) => {
            if (error) return reject(error);
            resolve(result!.secure_url);
          }
        )
        .end(buffer);
    });
  }
}