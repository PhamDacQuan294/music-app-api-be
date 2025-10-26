import { Request, Response } from "express";
import Account from "../../models/account.model";
import md5 from "md5";
import Role from "../../models/role.model";

// [POST] /admin/auth/login
export const loginPost = async (req: Request, res: Response) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await Account.findOne({
    email: email,
    deleted: false
  });

  if (!user) {
    res.json({
      code: 400,
      message: "Email không tồn tại!",
    })

    return;
  }

  if (md5(password) != user.password) {
    res.json({
      code: 400,
      message: "Mật khẩu không đúng!",
    })
    return;
  }

  if (user.status == "inactive") {
    res.json({
      code: 403,
      message: "Tài khoản của bạn đang bị khóa. Vui lòng liên hệ quản trị viên.",
    })
    return;
  }

  res.json({
    code: 200,
    message: "Đăng nhập thành công!",
    data: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      token: user.token,
      role: user.role_id,
    },
  })
}

// [POST] /admin/auth/verify
export const verify = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    const user = await Account.findOne({ token }).select("-password");

    if (!user) {
      return res.json({ code: 403, message: "Token không hợp lệ" });
    }

    const role = await Role.findOne({
      _id: user.role_id
    }).select("title permissions");

    return res.json({
      code: 200,
      message: "Token hợp lệ",
      user: user,
      role: role
    });
  } catch (error) {
    res.json({ code: 500, message: "Lỗi máy chủ" });
  }
};