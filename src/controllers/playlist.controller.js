import mongoose, { isValidObjectId, mongo } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    const user = req.user._id

    if (!name) {
        throw new ApiError(404, "Name is required")
    }

    const playlistExist = await Playlist.findOne({ name: name })

    if (playlistExist) {
        throw new ApiError(400, "Playlist with the given name already exists")
    }

    const playlist = await Playlist.create({
        name,
        description: description ?? "",
        owner: user,
        videos: []
    })

    if (!playlist) {
        throw new ApiError(400, "Some error occurred while creating playlist")
    }

    return res.status(200).json(
        new ApiResponse(200, playlist, "Playlist created successfully")
    )

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    //TODO: get user playlists
    const { userId } = req.params
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if (!playlistId) {
        throw new ApiError(404, "Playlist id is required")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(400, "Something went wrong while fetching playlist")
    }

    return res.status(200).json(
        new ApiResponse(200, playlist, "Playlist fetched successfully")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!videoId || !playlistId) {
        throw new ApiError(404, "Playlist id and video id are required")
    }

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist does not exist")
    }

    if (playlist.videos.includes(videoId)) {
        return res.status(200).json(
            new ApiResponse(200, {}, "Video is already in the playlist")
        )
    }

    const addedVideo = await Playlist.updateOne(
        { _id: new mongoose.Types.ObjectId(playlistId) },
        {
            $push: { videos: videoId }
        }
    )

    if (!addedVideo) {
        throw new ApiError(400, "Some error occurred while adding video")
    }

    return res.status(200).json(
        new ApiResponse(200, addedVideo, "Video added in the playlist")
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!videoId || !playlistId) {
        throw new ApiError(404, "Playlist id and video id are required")
    }

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist does not exist")
    }

    if (!playlist.videos.includes(videoId)) {
        throw new ApiError(200, {}, "Video is not in the playlist")
    }

    const removedVideo = await Playlist.updateOne(
        { _id: new mongoose.Types.ObjectId(playlistId) },
        { $pull: { videos: videoId } }
    )

    if (!removedVideo) {
        throw new ApiError(400, "Some error occurred while removing video")
    }

    return res.status(200).json(
        new ApiResponse(200, removedVideo, "Video removed successfully")
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    // TODO: delete playlist
    const { playlistId } = req.params

    if(!playlistId){
        throw new ApiError(404, "PLaylist id is required")
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)

    if(!deletedPlaylist){
        throw new ApiError(400, "Some error occurred while deleting playlist")
    }

    return res.status(200).json(
        new ApiResponse(200, deletedPlaylist, "Playlist deleted successfully")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}