import { Request, Response } from "express";
import Song from "../../models/song.model";
import Topic from "../../models/topic.model";
import Singer from "../../models/singer.model";
import { convertToSlug } from "../../helpers/convertToSlug";
import { filterStatus } from "../../helpers/filterStatus";
import { objectSearh } from "../../helpers/search";

// [GET] /api/v1/admin/songs
export const index = async (req: Request, res: Response) => {
  const statusFilters = filterStatus(req.query);

  let find = {
    deleted: false
  }

  if (req.query.status) {
    find["status"] = req.query.status;
  }

  // Search
  const searchObj = objectSearh(req.query);

  if (searchObj) {
    find["$or"] = [
      { title: searchObj.keywordRegex },
      { slug: searchObj.stringSlugRegex }
    ];
  } 

  const songs = await Song.find(find);

  res.json({
    code: 200,
    songs: songs,
    filterStatus: statusFilters
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

// [POST] /api/v1/admin/songs/create
export const createPost = async (req: Request, res: Response) => {
  const slug = convertToSlug(req.body.title);

  // console.log("FILES:", req["files"]);

  if (req.body.status) {
    req.body.status = JSON.parse(req.body.status);
  }

  const dataSong = {
    title: req.body.title,
    topicId: req.body.topicId,
    singerId: req.body.singerId,
    description: req.body.description,
    status: req.body.status === true ? "active" : "inactive",
    avatar: req?.body?.avatar?.[0] || "", 
    audio: req?.body?.audio?.[0] || "",   
    lyrics: req.body.lyrics,
    slug: slug
  };

  const song = new Song(dataSong);
  await song.save();

  res.json({
    code: 200,
    message: "Thêm thành công"
  })
}

// [DELETE] /api/v1/admin/songs/delete/:id
export const deleteSong = async (req: Request, res: Response) => {
  const id: string = req.params.id;
  
  await Song.updateOne({
    _id: id
  }, {
    deleted: true,
    deletedAt: new Date()
  })

  res.json({
    code: 200
  })
}

// [PATCH] /api/v1/admin/songs/edit/:id
export const editPatch = async (req: Request, res: Response) => {
  const id: string = req.params.id;

  let avatar = "";
  if (Array.isArray(req.body.avatar)) {
    avatar = req.body.avatar[0];
  } else {
    avatar = req.body.avatar;
  }

  let audio = "";
  if (Array.isArray(req.body.audio)) {
    audio = req.body.audio[0];
  } else {
    audio = req.body.audio;
  }


  if (req.body.status) {
    req.body.status = JSON.parse(req.body.status);
  }

  const dataSong = {
    title: req.body.title,
    topicId: req.body.topicId,
    singerId: req.body.singerId,
    description: req.body.description,
    status: req.body.status === true ? "active" : "inactive",
    avatar: avatar || "",
    audio: audio|| "",
    lyrics: req.body.lyrics,
  };

  await Song.updateOne({
    _id: id
  }, dataSong);


  res.json({
    code: 200
  })

}

// [GET] /api/v1/admin/songs/search-song
export const searchSong = async (req: Request, res: Response) => {
  try {
    const keyword: string = `${req.query.keyword || ""}`;
    
    let newSongs: any[] = [];

    if (keyword) {
      const keywordRegex = new RegExp(keyword, "i");

      const stringSlug = convertToSlug(keyword);
      const stringSlugRegex = new RegExp(stringSlug, "i");

      const songs = await Song.find({
        $or: [
          { title: keywordRegex },
          { slug: stringSlugRegex }
        ]
      }).lean();

      newSongs.push(songs);
    } 

    res.json({
      code: 200,
      newSongs: newSongs
    })
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: "Lỗi server"
    });
  }
}

// [PATCH] /api/v1/admin/songs/change-status/:status/:id
export const changeStatus = async (req: Request, res: Response) => {
  const status: string = req.params.status;
  const id: string = req.params.id;

  await Song.updateOne({
    _id: id
  }, {
    status: status
  })

  res.json({
    code: 200,
    id,
    status
  })
}