import { Request, Response } from "express";
import { convertToSlug } from "../../helpers/convertToSlug";
import Song from "../../models/song.model";
import Singer from "../../models/singer.model";
import FavoriteSong from "../../models/favorite-song.model";


// [GET] /api/v1/search/:type
export const result = async (req: Request, res: Response) => {
  try {
    const keyword: string = `${req.query.keyword || ""}`;
    const type: string = req.params.type;

    let newSongs: any[] = [];

    if (keyword) {
      const keywordRegex = new RegExp(keyword, "i");

      // Tạo ra slug không dấu, có thêm dấu - ngăn cách
      const stringSlug = convertToSlug(keyword);
      const stringSlugRegex = new RegExp(stringSlug, "i");

      const songs = await Song.find({
        $or: [
          { title: keywordRegex },
          { slug: stringSlugRegex }
        ]
      }).lean();

      for (const item of songs) {
        const infoSinger = await Singer.findOne({
          _id: item.singerId
        });

        newSongs.push({
          id: item._id,
          title: item.title,
          avatar: item.avatar,
          like: item.like,
          slug: item.slug,
          infoSinger: {
            fullName: infoSinger.fullName
          }
        });
      }
    }

    switch (type) {
      case "result":
        res.json({
          code: 200,
          message: "Thành công",
          songs: newSongs
        });
        break;
      case "suggest":
        res.json({
          code: 200,
          message: "Thành công",
          songs: newSongs
        });
        break;
      default:
        break;
    }

  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: "Lỗi server"
    });
  }
}