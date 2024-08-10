import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View Credentials' below to copy your API secret
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        console.log("Entered in cloudinary utility function, localFile Path", localFilePath)
        if(!localFilePath) {
            console.log("Locafile path not found")
            return null;
        }

        //upload on Cloudinary

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        console.log("Response ===> ", response)
        //Uploaded successfully
        console.log("File uploaded successfully", response.url)
        return response

    }   catch(error) {
        fs.unlinkSync(localFilePath)  //remove the locally saved file 
        return null;
    }
}


export {uploadOnCloudinary}