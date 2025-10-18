import { Request, Response } from "express";
import Singer from "../../models/singer.model";
import { filterStatus } from "../../helpers/filterStatus";
import { objectSearh } from "../../helpers/search";

// [GET] /api/v1/admin/singers
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
      { fullName: searchObj.keywordRegex },
      { slug: searchObj.stringSlugRegex }
    ];
  }
  // End Search

  // Sort
  let sort: any = {};

  if (req.query.sortKey && req.query.sortValue) {
    let sortKey = String(req.query.sortKey);
    const sortValue = req.query.sortValue === "desc" ? -1 : 1;

    if (sortKey === "title") {
      sortKey = "fullName";
    }
    
    sort[sortKey] = sortValue;
  } else {
    sort["position"] = -1;
  }
  // End Sort

  const singers = await Singer.find(find)
    .sort(sort);

  res.json({
    code: 200,
    singers: singers,
    filterStatus: statusFilters,
  })
}

// [PATCH] /api/v1/admin/singers/change-multi
export const changeMulti = async (req: Request, res: Response) => {
  const type: string = req.body.status;
  const ids = req.body.ids;

  const cleanIds = ids.map(item => item.includes("-") ? item.split("-")[0] : item);

  switch (type) {
    case "active":
      await Singer.updateMany({ _id: { $in: cleanIds } }, { status: "active" });
      break;
    case "inactive":
      await Singer.updateMany({ _id: { $in: cleanIds } }, { status: "inactive" });
      break;
     case "delete-all":
      await Singer.updateMany({ _id: { $in: cleanIds } }, {
        deleted: true,
        deletedAt: new Date()
      })
      let find = {
        deleted: false
      };
      const singers = await Singer.find(find);
      return res.json({
        code: 200,
        newType: singers
      })
    case "change-position":
      const idList = [];
      for (const item of ids) {
        let [id, position] = item.split("-");
        idList.push(id);

        position = parseInt(position);

        await Singer.updateOne({
          _id: id
        }, {
          position: position
        });
      }
      const newSingers = await Singer.find({ _id: { $in: idList } });

      res.json({
        code: 200,
        newType: newSingers
      });
      return;
    default:
      break;
  }

  const newSingers = await Singer.find({ _id: { $in: cleanIds } })

  res.json({
    code: 200,
    newType: newSingers,
  })
}