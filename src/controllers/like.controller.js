import mongoose from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(404, "Video id is required")
    }

    console.log(videoId)

    const user = req.user._id
    const likedVideo = await Like.findOne({ video: videoId, likedBy: user })
    let toggledLike

    if (likedVideo) {
        toggledLike = await Like.deleteOne({ video: videoId, likedBy: user })
    }
    else {
        toggledLike = await Like.create({ video: videoId, likedBy: user })
    }

    if (!toggledLike) {
        throw new ApiError(400, "Some error occured while toggling like")
    }

    return res.status(200).json(
        new ApiResponse(200, toggledLike, "Like toggled successfully")
    )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!commentId) {
        throw new ApiError(404, "Comment id is required")
    }

    let toggledLike
    const user = req.user._id
    const likedComment = await Like.findOne({ comment: commentId, likedBy: user })

    if (likedComment) {
        toggledLike = await Like.deleteOne({ comment: commentId, likedBy: user })
    } else {
        toggledLike = await Like.create({ comment: commentId, likedBy: user })
    }

    if (!toggledLike) {
        throw new ApiError(400, "Some error occured while toggling like")
    }

    return res.status(200).json(
        new ApiResponse(200, toggledLike, "Like toggled successfully")
    )

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    if (!tweetId) {
        throw new ApiError(404, "Comment id is required")
    }

    let toggledLike
    const user = req.user._id
    const likedTweet = await Like.findOne({ tweet: tweetId, likedBy: user })

    if (likedTweet) {
        toggledLike = await Like.deleteOne({ tweet: tweetId, likedBy: user })
    } else {
        toggledLike = await Like.create({ tweet: tweetId, likedBy: user })
    }

    if (!toggledLike) {
        throw new ApiError(400, "Some error occured while toggling like")
    }

    return res.status(200).json(
        new ApiResponse(200, toggledLike, "Like toggled successfully")
    )
}
)

const getLikedVideos = asyncHandler(async (req, res) => {

    const user = req.user._id;

    if (!user) {
        throw new ApiError(400, "Login is required")
    }

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(user),
                video: {
                    $exists: true
                }
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline: [{
                    $project: {
                        title: 1,
                        description: 1,
                        videoFile: 1,
                        thumbnail: 1
                    },
                }],
            },
        },
        {
            $addFields: {
                video:{
                    $first: "$video"
                }
            }
        },
        {
            $project: {
                video: 1,
                _id: 0
            }
        },
    ])

    if(!likedVideos){
        throw new ApiError(400, "Some error occurred while fetching liked videos")
    }

    return res.status(200).json(
        new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}