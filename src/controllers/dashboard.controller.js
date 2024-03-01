import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {

    const channelStats = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "owner",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $group: {
                _id: null,
                totalVideos: {$sum: 1},
                totalViews: {$sum: "$views"},
                totalSubscribers: {$sum: "$subscribers"},
                totalLikes: {$sum: "$likes"}
            }
        },
        {
            $project: {
                _id: 0,
                totalVideos: 1,
                totalViews: 1,
                totalSubscribers: 1,
                totalLikes: 1
            }
        }
    ])

    if(!channelStats){
        throw new ApiError(400,"Unable to fetch the channel stats")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,channelStats,"Channel Stats fetched Successfully"))

})

const getChannelVideos = asyncHandler(async (req, res) => {

    const video = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user?._id)
            }
        }
    ])

    if (!video || video.length == 0) {
        throw new ApiError(400, "Videos not found")
    }

    return res.status(200).json(
        new ApiResponse(200, video, "Videos fetched successfully")
    )
})

export {
    getChannelStats, 
    getChannelVideos
}