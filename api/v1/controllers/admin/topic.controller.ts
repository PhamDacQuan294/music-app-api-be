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