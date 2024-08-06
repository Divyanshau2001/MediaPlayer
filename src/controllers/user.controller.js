import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError }  from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req, res) => {
    //take i/p from frontend (name, email, password)
    const {username, email, fullname, password} = req.body
    console.log("email: ", email)

    //validations
    if(
        [fullname, email, username, password].some((field) => field?.trim() === "" )
    )  {
        throw new ApiError(400, "All fields are compulsory")
    }

    //if user already exists (using username and email)
    const existingUser = User.findOne({
        $or: [{username}, {email}]
    })

    if(existingUser) {
        throw new ApiError(400, "User already exists")
    }

    //check for image and Avatar
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }

    //upload image to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar) {
        throw new ApiError(400, "Avatar is required")
    }

    //create user object  - create entry in DB
    const user = await User.create({
        fullname, 
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password, 
        username: username.toLowerCase() 
    })

    //remove password and refresh token from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    //check for user creation
    if(createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user") 
    }

    //return response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )


})


export { registerUser }