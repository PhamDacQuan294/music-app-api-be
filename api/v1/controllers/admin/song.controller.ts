import { Request, Response } from "express";
import Song from "../../models/song.model";
import Topic from "../../models/topic.model";
import Singer from "../../models/singer.model";

// [GET] /api/v1/admin/songs
export const index = async (req: Request, res: Response) => {
  const songs = await Song.find({
    deleted: false
  });

  res.json({
    code: 200,
    songs: songs
  })
}

// [GET] /api/v1/admin/songs/create
export const create = async (req: Request, res: Response) => {
  const topics = await Topic.find({
    status: "active",
    deleted: false
  }).select("title");

  const singers = await Singer.find({
    status: "active",
    deleted: false
  }).select("fullName");

  res.json({
    code: 200,
    topics: topics,
    singers: singers
  })
}