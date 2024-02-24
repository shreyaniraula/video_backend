import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    console.log(req.body)
    const { content } = req.body

    if (!content) {
        console.log(content)
        throw new ApiError(400, "Tweet content is required")
    }

    //create tweet
    const tweet = await Tweet.create({
        owner: req.user?._id,
        content: content
    })

    //check if tweet is created
    if (!tweet) {
        throw new ApiError(500, "Something went wrong while creating tweet")
    }

    return res
        .status(201)
        .json(
            new ApiResponse(200, tweet, "Tweet created successfully")
        )
})

const getUserTweets = asyncHandler(async (req, res) => {

    //find multiple tweets of the user
    const tweet = await Tweet.find({ owner: req.user?._id })

    if (!tweet) {
        throw new ApiError(404, "No tweets found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, tweet, "Tweets fetched successfully")
        )
})

const updateTweet = asyncHandler(async (req, res) => {

    const { content } = req.body

    if (!content) {
        throw new ApiError(400, "New tweet is required")
    }

    const tweet = await Tweet.findByIdAndUpdate(
        req.params.tweetId,
        {
            $set: {
                content: content
            },
        },
        { new: true }
    )
    if (!tweet) {
        throw new ApiError(400, "Error occurred while updating the tweet")
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, tweet, "Tweet updated successfully")
        )
})

const deleteTweet = asyncHandler(async (req, res) => {
    const tweetId = req.params.tweetId

    if (!tweetId) {
        throw new ApiError(404, "Tweet not found")
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId)

    if (!deletedTweet) {
        throw new ApiError(500, "Error occurred while deleting the tweet")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, deletedTweet, "Tweet deleted successfully")
        )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}