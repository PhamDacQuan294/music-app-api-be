import { Request, Response } from "express";
import Topic from "../../models/topic.model";

// [GET] /api/v1/admin/topics
export const index = async (req: Request, res: Response) => {
  const topics = await Topic.find({
    deleted: false
  });

  res.json({
    code: 200,
    topics: topics
  })
}