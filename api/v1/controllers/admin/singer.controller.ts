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

  const singers = await Singer.find(find);

  res.json({
    code: 200,
    singers: singers,
    filterStatus: statusFilters,
  })
}
