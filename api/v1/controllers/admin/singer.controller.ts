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
