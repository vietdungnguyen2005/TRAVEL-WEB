import { v2 as cloudinary } from 'cloudinary';
// Configure Cloudinary
if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
        cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}
export { cloudinary };
// Helper function to upload image
export async function uploadToCloudinary(file, folder = 'travel-booking') {
    try {
        const result = await cloudinary.uploader.upload(file, {
            folder,
            resource_type: 'auto',
            transformation: [
                { width: 1200, height: 800, crop: 'limit' },
                { quality: 'auto', fetch_format: 'auto' },
            ],
        });
        return {
            url: result.secure_url,
            publicId: result.public_id,
        };
    }
    catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Failed to upload image');
    }
}
// Helper function to delete image
export async function deleteFromCloudinary(publicId) {
    try {
        await cloudinary.uploader.destroy(publicId);
    }
    catch (error) {
        console.error('Cloudinary delete error:', error);
        throw new Error('Failed to delete image');
    }
}
// Check if Cloudinary is configured
export function isCloudinaryConfigured() {
    return !!(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET);
}
//# sourceMappingURL=cloudinary-config.js.map