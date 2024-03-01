import mongoose, {isValidObjectId} from "mongoose"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    // TODO: toggle subscription
    const {channelId} = req.params
    const user = req.user?._id

    if(!channelId){
        throw new ApiError(404, "Channel id is required")
    }

    const isSubscribed = await Subscription.findOne({
        subscriber: user, channel: channelId
    })

    if(!isSubscribed){
        const createSubscription = await Subscription.create({
            subscriber: user,
            channel: channelId
        })

        if(!createSubscription){
            throw new ApiError(400, "Unable to subscribe")
        }

        return res.status(200).json(
            new ApiResponse(200, createSubscription, "Subscribed to the channel")
        )
    }
    else{
        const deleteSubscription = await Subscription.deleteOne({
            subscriber: user,
            channel: channelId
        })

        if(!deleteSubscription){
            throw new ApiError(400, "Unable to unsubscribe")
        }

        return res.status(200).json(
            new ApiResponse(200, deleteSubscription, "Unsubscribed to the channel")
        )
    }


})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {subscriberId} = req.params
    if(!subscriberId){
        throw new ApiError(404, "Channel id is required")
    }

    const userChannelSubscribers = await Subscription.find({channel: subscriberId})

    if(!userChannelSubscribers){
        throw new ApiError(400, "Something went wrong while fetching subscribers")
    }

    return res.status(200).json(
        new ApiResponse(200, userChannelSubscribers, "Subscribers fetched successfully")
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    console.log(req.params)
    if(!channelId){
        throw new ApiError(404, "Subscriber id is required")
    }

    const subscribedChannels = await Subscription.find({subscriber: channelId})

    if(!subscribedChannels){
        throw new ApiError(400, "Something went wrong while fetching subscribed channels")
    }

    return res.status(200).json(
        new ApiResponse(200, subscribedChannels, "Subscribed channels fetched successfully")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}