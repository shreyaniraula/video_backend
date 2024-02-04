import { v2 as cloudinary } from 'cloudinary'
import { response } from 'express';
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null

        //upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,
            { resource_type: "auto" }
        )
        return response

    } catch (error) {
        //remove locally saved temporary file as upload file operation failed
        fs.unlink(localFilePath)
        return null
    }
}

export {uploadOnCloudinary}