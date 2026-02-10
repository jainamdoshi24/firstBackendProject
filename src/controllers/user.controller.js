import {asyncHandler} from '../utils/asyncHandler.js';
import apiError from '../utils/apiError.js';
import {User} from '../models/user.model.js';
import uploadToCloudinary from '../utils/cloudinary.js';
import apiResponse from '../utils/apiResponse.js';

const registerUser = asyncHandler(async (req, res) => {
    // Get user details from frontend
    const {fullName, email, username, password} = req.body;
    console.log("Received user details:", {fullName, email, username, password: password ? 'Provided' : 'Not Provided'});

    // Validate user details
    if(
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new apiError("All fields are required", 400);
    }

    // Check if user already exists : username or email already exists
    const existedUser = await User.findOne({
        $or: [{username}, {email}]    // $or operator can check for multiple conditions, if any of the condition is true, it will return the document
    })
    if(existedUser) {
        throw new apiError("User with the same email or username already exists", 409);
    }

    // Check for images and avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    console.log("Received files:", req.files);
    if(!avatarLocalPath) {
        throw new apiError("Avatar image is required", 400);
    }

    // Upload them to cloudinary and get the url, avatar
    const avatar = await uploadToCloudinary(avatarLocalPath);
    const coverImage = await uploadToCloudinary(coverImageLocalPath);
    if(!avatar) {
        throw new apiError("Failed to upload avatar image", 500);
    }

    // Create user object - create entry in database
    const user = await User.create({
        fullName,
        email,
        username: username.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    })

    // Remove password and refresh token from the response
    // Check for user creation success
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    ) // Exclude password and refresh token from the response

    if(!createdUser) {
        throw new apiError("Failed to create user", 500);
    }


    // Return response
    return res.status(201).json(
        new apiResponse(201, "User registered successfully", createdUser)
    )
})

export {registerUser};
