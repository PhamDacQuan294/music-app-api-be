import { Request, Response }  from "express";
import Topic from "../../models/topic.model"
import Song from "../../models/song.model";
import Singer from "../../models/singer.model";

// [GET] /api/v1/songs/:slugTopic
export const list = async (req: Request, res: Response) => {
  const topic = await Topic.findOne({
    slug: req.params.slugTopic,
    status: "active",
    deleted: false
  });

  const songs = await Song.find({
    topicId: topic._id,
    status: "active",
    deleted: false
  })
    .select("avatar title slug singerId like")
    .lean(); ;

  for (const song of songs) {
    const infoSinger = await Singer.findOne({
      _id: song.singerId,
      status: "active",
      deleted: false
    });

   (song as any).infoSinger = infoSinger;
  }

  res.json({
    code: 200,
    songs: songs
  })
}