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

  // Sort
  let sort: any = {};

  if (req.query.sortKey && req.query.sortValue) {
    const sortKey = String(req.query.sortKey);
    const sortValue = req.query.sortValue === "desc" ? -1 : 1;
    sort[sortKey] = sortValue;
  } else {
    sort["position"] = -1;
  }

  // Pagination
  let objectPagination = {
    currentPage: 1,
    limitItems: 4,
    skip: 0,
  }

  if (req.query.page) {
    objectPagination.currentPage = parseInt(req.query.page as string, 10);
  }

  objectPagination["skip"] = (objectPagination.currentPage - 1) * objectPagination.limitItems;

  const countSongs = await Song.countDocuments(find);
  const totalPage = Math.ceil(countSongs / objectPagination.limitItems);
  objectPagination["totalPage"] = totalPage;

  // End pagination

  const songs = await Song.find(find)
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip)
    .sort(sort);

  res.json({
    code: 200,
    songs: songs,
    filterStatus: statusFilters,
    pagination: objectPagination
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
  try {
    const slug = convertToSlug(req.body.title);

    const existed = await Song.findOne({ slug });

    if (existed) {
      res.json({
        code: 400,
        message: "Tiêu đề đã tồn tại, vui lòng nhập tiêu đề khác!"
      })
    }

    // console.log("FILES:", req["files"]);

    if (req.body.status) {
      req.body.status = JSON.parse(req.body.status);
    }


    if (!req.body.position || req.body.position == "") {
      const countSongs = await Song.countDocuments();
      req.body.position = countSongs + 1;
    } else {
      req.body.position = parseInt(req.body.position);
    }

    const dataSong = {
      title: req.body.title,
      topicId: req.body.topicId,
      position: req.body.position,
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
      song: song
    })
  } catch (error) {
    console.log(error);
    res.json({
      code: 500,
      message: "Có lỗi xảy ra ở server"
    })
  }
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
    code: 200,
    id
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

  if (req.body.position == "") {
    const countSongs = await Song.countDocuments();
    req.body.position = countSongs + 1;
  } else {
    req.body.position = parseInt(req.body.position);
  }


  const dataSong = {
    title: req.body.title,
    topicId: req.body.topicId,
    position: req.body.position,
    singerId: req.body.singerId,
    description: req.body.description,
    status: req.body.status === true ? "active" : "inactive",
    avatar: avatar || "",
    audio: audio || "",
    lyrics: req.body.lyrics,
  };

  await Song.updateOne({
    _id: id
  }, dataSong);

  const updatedSong = await Song.findById(id);

  res.json({
    code: 200,
    song: updatedSong
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

// [PATCH] /api/v1/admin/songs/change-multi
export const changeMulti = async (req: Request, res: Response) => {
  const type: string = req.body.status;
  const ids = req.body.ids;

  const cleanIds = ids.map(item => item.includes("-") ? item.split("-")[0] : item);

  switch (type) {
    case "active":
      await Song.updateMany({ _id: { $in: cleanIds } }, { status: "active" });
      break;
    case "inactive":
      await Song.updateMany({ _id: { $in: cleanIds } }, { status: "inactive" });
      break;
    case "delete-all":
      await Song.updateMany({ _id: { $in: cleanIds } }, {
        deleted: true,
        deletedAt: new Date()
      })
      let find = {
        deleted: false
      };
      const songs = await Song.find(find);
      return res.json({
        code: 200,
        newType: songs
      })
    case "change-position":
      const idList = [];
      for (const item of ids) {
        let [id, position] = item.split("-");
        idList.push(id);

        position = parseInt(position);

        await Song.updateOne({
          _id: id
        }, {
          position: position
        });
      }
      const newSongs = await Song.find({ _id: { $in: idList } });

      res.json({
        code: 200,
        newType: newSongs
      });
      return;
    default:
      break;
  }

  const newSongs = await Song.find({ _id: { $in: cleanIds } });

  res.json({
    code: 200,
    newType: newSongs
  });
}