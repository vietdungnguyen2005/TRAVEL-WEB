import { v2 as cloudinary } from 'cloudinary';
export { cloudinary };
export declare function uploadToCloudinary(file: Buffer | string, folder?: string): Promise<{
    url: string;
    publicId: string;
}>;
export declare function deleteFromCloudinary(publicId: string): Promise<void>;
export declare function isCloudinaryConfigured(): boolean;
//# sourceMappingURL=cloudinary-config.d.ts.map