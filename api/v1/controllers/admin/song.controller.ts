import { Request, Response } from "express";
import Song from "../../models/song.model";

// [GET] /api/v1/admin/songs
export const index = async (req: Request, res: Response) => {
  const songs = await Song.find({
    deleted: false
  });

  console.log(songs);
  
  res.json({
    code: 200,
    songs: songs
  })
}