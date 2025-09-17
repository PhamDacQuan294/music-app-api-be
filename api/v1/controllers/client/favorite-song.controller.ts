import { Request, Response } from "express";
import FavoriteSong from "../../models/favorite-song.model"
import Singer from "../../models/singer.model";
import Song from "../../models/song.model";

// [GET] /api/v1/favorite-songs/
export const index = async (req: Request, res: Response) => {
  const favoriteSongs = await FavoriteSong.find({
    deleted: false
  }).lean();

  for (const item of favoriteSongs) {
    const infoSong = await Song.findOne({
      _id: item.songId
    });

    const infoSinger = await Singer.findOne({
      _id: infoSong.singerId
    });

    item["infoSong"] = infoSong;
    item["infoSinger"] = infoSinger;
  }

  res.json({
    code: 200,
    favoriteSongs: favoriteSongs
  })
}