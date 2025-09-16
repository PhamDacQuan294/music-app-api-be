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

// [GET] /api/v1/songs/detail/:slugSong
export const detail = async (req: Request, res: Response) => {
  const slugSong: string = req.params.slugSong;

  const song = await Song.findOne({
    slug: slugSong,
    status: "active",
    deleted: false
  });

  const singer = await Singer.findOne({
    _id: song.singerId,
    deleted: false,
  }).select("fullName");

  const topic = await Topic.findOne({
    _id: song.topicId,
    deleted: false
  }).select("title");

  res.json({
    code: 200,
    song: song,
    singer: singer,
    topic: topic
  })
}

// [PATCH] /api/v1/songs/like/:typeLike/:idsong
export const like = async (req: Request, res: Response) => {
  const idSong: string = req.params.idSong;
  const typeLike: string = req.params.typeLike;

  const song = await Song.findOne({
    _id: idSong,
    status: "active",
    deleted: false
  });

  const newLike: number = typeLike == "like" ? song.like + 1 : song.like - 1;

  await Song.updateOne({
    _id: idSong
  }, {
    like: newLike
  });

  res.json({
    code: 200,
    like: newLike
  });
};