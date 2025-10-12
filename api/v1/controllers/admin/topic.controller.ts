import { Request, Response } from "express";
import Topic from "../../models/topic.model";
import { filterStatus } from "../../helpers/filterStatus";
import { objectSearh } from "../../helpers/search";
import { convertToSlug } from "../../helpers/convertToSlug";

// [GET] /api/v1/admin/topics
export const index = async (req: Request, res: Response) => {
  const statusFilters = filterStatus(req.query);

  let find = {
    deleted: false
  };

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

  const countTopics = await Topic.countDocuments(find);
  const totalPage = Math.ceil(countTopics / objectPagination.limitItems);
  objectPagination["totalPage"] = totalPage;

  // End pagination

  const topics = await Topic.find(find)
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip)
    .sort(sort);

  res.json({
    code: 200,
    topics: topics,
    filterStatus: statusFilters,
    pagination: objectPagination
  })
}

// [PATCH] /api/v1/admin/topics/change-status/:status/:id
export const changeStatus = async (req: Request, res: Response) => {
  const status: string = req.params.status;
  const id: string = req.params.id;

  await Topic.updateOne({
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

// [PATCH] /api/v1/admin/topics/change-multi
export const changeMulti = async (req: Request, res: Response) => {
  const type: string = req.body.status;
  const ids = req.body.ids;

  const cleanIds = ids.map(item => item.includes("-") ? item.split("-")[0] : item);

  console.log(ids);

  switch (type) {
    case "active":
      await Topic.updateMany({ _id: { $in: cleanIds } }, { status: "active" });
      break;
    case "inactive":
      await Topic.updateMany({ _id: { $in: cleanIds } }, { status: "inactive" });
      break;
    case "delete-all":
      await Topic.updateMany({ _id: { $in: cleanIds } }, {
        deleted: true,
        deletedAt: new Date()
      })
      let find = {
        deleted: false
      };
      const topics = await Topic.find(find);
      return res.json({
        code: 200,
        newType: topics
      })
    case "change-position":
      const idList = [];
      for (const item of ids) {
        let [id, position] = item.split("-");
        idList.push(id);

        position = parseInt(position);

        await Topic.updateOne({
          _id: id
        }, {
          position: position
        });
      }
      const newTopics = await Topic.find({ _id: { $in: idList } });

      res.json({
        code: 200,
        newType: newTopics
      });
      return;
    default:
      break;
  }

  const newTopics = await Topic.find({ _id: { $in: cleanIds } })

  res.json({
    code: 200,
    newType: newTopics,
  })
}

// [POST] /api/v1/admin/topics/create
export const createPost = async (req: Request, res: Response) => {
  try {
    const slug = convertToSlug(req.body.title);
    
    const existed = await Topic.findOne({ slug });

    if (existed) {
      res.json({
        code: 400,
        message: "Tiêu đề đã tồn tại, vui lòng nhập tiêu đề khác!"
      })
    }

    if (req.body.status) {
      req.body.status = JSON.parse(req.body.status);
    }


    if (!req.body.position || req.body.position == "") {
      const countTopics = await Topic.countDocuments();
      req.body.position = countTopics + 1;
    } else {
      req.body.position = parseInt(req.body.position);
    }

    const dataSong = {
      title: req.body.title,
      position: req.body.position,
      description: req.body.description,
      status: req.body.status === true ? "active" : "inactive",
      avatar: req?.body?.avatar?.[0] || "",
      slug: slug
    };

    const topic = new Topic(dataSong);
    await topic.save();

    res.json({
      code: 200,
      topic: topic
    })

  } catch (error) {
    res.json({
      code: 500,
      message: "Có lỗi xảy ra ở server"
    })
  }
}

// [DELETE] /api/v1/admin/topics/delete/:id
export const deleteTopic = async (req: Request, res: Response) => {
  const id: string = req.params.id;

  await Topic.updateOne({
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

// [PATCH] /api/v1/admin/topics/edit/:id
export const editPatch = async (req: Request, res: Response) => {
  try {
    const id: string = req.params.id;

    let avatar = "";

    if (Array.isArray(req.body.avatar)) {
      avatar = req.body.avatar[0];
    } else {
      avatar = req.body.avatar;
    }

    if (req.body.status) {
      req.body.status = JSON.parse(req.body.status);
    }

    if (req.body.position == "") {
      const countSongs = await Topic.countDocuments();
      req.body.position = countSongs + 1;
    } else {
      req.body.position = parseInt(req.body.position);
    }


    const dataTopic = {
      title: req.body.title,
      description: req.body.description,
      position: req.body.position,
      status: req.body.status === true ? "active" : "inactive",
      avatar: avatar || "",
    };

    await Topic.updateOne({
      _id: id
    }, dataTopic);

    const updatedTopic = await Topic.findById(id);

    res.json({
      code: 200,
      topic: updatedTopic
    })

  } catch (error) {
    console.log(error)
    res.json({
      code: 400,
    })
  }
}