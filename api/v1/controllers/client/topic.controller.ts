import { Request, Response }  from "express";
import Topic from "../../models/topic.model";

// [GET] /api/v1/topics
export const index = async (req: Request, res: Response) => {
  const find = {
    deleted: false
  };

  const topics = await Topic.find(find);

  res.json(topics);
}