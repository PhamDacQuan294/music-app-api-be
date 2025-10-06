import { Request, Response } from "express";
import Topic from "../../models/topic.model";
import { filterStatus } from "../../helpers/filterStatus";
import { objectSearh } from "../../helpers/search";

// [GET] /api/v1/admin/topics
export const index = async (req: Request, res: Response) => {
  const statusFilters = filterStatus(req.query);

  // console.log(req.query.keyword);

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

  const topics = await Topic.find(find)
    .sort(sort);

  res.json({
    code: 200,
    topics: topics,
    filterStatus: statusFilters
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