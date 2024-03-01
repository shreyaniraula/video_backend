import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    let { page = 1, limit = 10, sortBy = "createdAt", sortType, userId } = req.query

    limit = parseInt(limit)
    page = parseInt(page)

    if (!userId) {
        throw new ApiError(404, "User Id is required")
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortType === "desc" ? -1 : 1;

    const video = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $sort: sortOptions
        },
        {
            $skip: (page - 1) * limit
        },
    {
            $limit: limit
        }
    ])

    if (!video || video.length == 0) {
        throw new ApiError(400, "Videos not found")
    }

    return res.status(200).json(
        new ApiResponse(200, video, "Videos fetched successfully")
    )
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    const owner = req.user?._id

    if (!title || !description) {
        throw new ApiError(400, "Title and description are required")
    }

    let videoFileLocalPath, thumbnailLocalPath
    if (req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0) {
        videoFileLocalPath = req.files?.videoFile[0]?.path
    }

    if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
        thumbnailLocalPath = req.files?.thumbnail[0]?.path
    }

    if (!videoFileLocalPath) {
        throw new ApiError(400, "Video file is required")
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required")
    }

    //upload on cloudinary
    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!videoFile) {
        throw new ApiError(400, "Error while uploading video file")
    }
    if (!thumbnail) {
        throw new ApiError(400, "Error while uploading thumbnai file")
    }

    const video = await Video.create({
        videoFile: videoFile?.url,
        thumbnail: thumbnail?.url,
        title,
        description,
        duration: videoFile?.duration,
        owner
    })

    if (!video) {
        throw new ApiError(400, "Something went wrong while publishing video")
    }

    return res.status(201).json(new ApiResponse(200, video, "Video published successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(404, "Video Id is required")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video does not exist")
    }

    return res.status(200).json(
        new ApiResponse(200, video, "Video fetched successfully")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body
    const thumbnailLocalPath = req.file?.path

    if (!videoId) {
        throw new ApiError(404, "Video id is required")
    }

    if (!title || !description) {
        throw new ApiError(404, "All fields are required")
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(404, "Thumbnail is required")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!thumbnail) {
        throw new ApiError(400, "Error while uploading thumbnail")
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                description,
                thumbnail: thumbnail.url
            }
        },
        { new: true }
    )

    if (!updatedVideo) {
        throw new ApiError(500, "Some error occured while updating the video")
    }

    return res.status(200).json(
        new ApiResponse(
            200, updatedVideo, "Video details updated successfully"
        ))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(404, "Video Id is required")
    }

    const deletedVideo = await Video.findByIdAndDelete(videoId)

    if (!deletedVideo) {
        throw new ApiError(400, "Some error occurred while deleting the video")
    }

    return res.status(200).json(
        new ApiResponse(200, deletedVideo, "Video deleted successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(404, "Video id is required")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    const toggledPublishStatus = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !video.isPublished
            }
        }
    )

    if (!toggledPublishStatus) {
        throw new ApiError(400, "Some error occured while toggling publish status")
    }

    return res.status(200).json(
        new ApiResponse(200, toggledPublishStatus, "Publish status toggled successfully")
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}