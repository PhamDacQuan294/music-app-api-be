import { Request, Response } from "express";
import Song from "../../models/song.model"

// [GET] /api/v1/admin/statistics/songs
export const index = async (req: Request, res: Response) => {
  let find = {
    deleted: false
  }

  const songs = await Song.find(find)
   
  res.json({
    code: 200,
    songs: songs,
  })
}
