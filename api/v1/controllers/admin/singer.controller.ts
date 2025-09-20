import { Request, Response } from "express";
import Singer from "../../models/singer.model";

// [GET] /api/v1/admin/singers
export const index = async (req: Request, res: Response) => {
  const singers = await Singer.find({
    deleted: false
  });

  res.json({
    code: 200,
    singers: singers
  })
}
