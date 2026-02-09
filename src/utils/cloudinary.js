import {v2 as cloudinary} from "cloudinary";
import fs from "fs";


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});


const uploadToCloudinary = async (localfilePath) => {
    try {
        if(!localfilePath) {
            return null;
        }
        //Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localfilePath, {
            resource_type: "auto",
        });//File has been uploaded successfully
        console.log("File uploaded to Cloudinary successfully", response.url);
        return response;
    } catch (error) {
        fs.unlinkSync(localfilePath); // remove the locally saved temporary file as upload operation has failed
        return null;
    }
}

export default uploadToCloudinary;