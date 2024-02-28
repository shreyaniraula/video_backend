import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!videoId) {
        throw new ApiError(404, "Video id not found")
    }

    const videoComments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "users",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            avatar: 1,
                            username: 1,
                            _id: 0
                        }
                    }
                ]
            }
        }
    ])

    if (!videoComments) {
        throw new ApiError(400, "Something went wrong")
    }

    return res.status(200).json(
        new ApiResponse(200, videoComments, "Comments fetched successfully")
    )

})

const addComment = asyncHandler(async (req, res) => {
    const { content } = req.body
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(404, "Video id is required")
    }
    if (!content) {
        throw new ApiError(404, "Content is required")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    const comment = await Comment.create({ owner: req.user?._id, content, video: videoId })

    if (!comment) {
        throw new ApiError(400, "Some error occurred while adding comment")
    }

    return res.status(200).json(
        new ApiResponse(200, comment, "Comment added successfully")
    )
})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const { content } = req.body
    console.log(content)

    if (!commentId) {
        throw new ApiError(404, "Comment id is required")
    }
    if (!content) {
        throw new ApiError(404, "Content is required")
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: { content: content }
        },
        { new: true }
    )

    if (!updatedComment) {
        throw new ApiError(400, "Some error occurred while updating comment")
    }

    return res.status(200).json(
        new ApiResponse(200, updatedComment, "Comment updated successfully")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!commentId) {
        throw new ApiError(404, "Comment id is required")
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId)

    if (!deletedComment) {
        throw new ApiError(400, "Some error occurred while deleting comment")
    }

    return res.status(200).json(
        new ApiResponse(200, deletedComment, "Comment deleted successfully")
    )
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}