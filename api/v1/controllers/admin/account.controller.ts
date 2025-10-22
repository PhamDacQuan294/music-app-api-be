import { Request, Response } from "express";
import Account from "../../models/account.model";
import Role from "../../models/role.model";

// [GET] /admin/accounts
export const index = async (req: Request, res: Response) => {
  let find = {
    deleted: false
  };

  const records = await Account.find(find).select("-password-token");

  const results: any[] = [];

  for (const record of records) {
    const role = await Role.findOne({
      _id: record.role_id,
      deleted: false
    });

    const item = JSON.parse(JSON.stringify(record));
    item.role = role;
    results.push(item);
  }

  res.json({
    code: 200,
    accounts: results
  })
}