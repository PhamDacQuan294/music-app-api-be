import { Request, Response, NextFunction } from "express";
import Account from "../../models/account.model";

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Lấy token từ header Authorization
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ code: 401, message: "Token không tồn tại" });
    }

    // tách "Bearer <token>"
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ code: 401, message: "Token không tồn tại" });
    }

    // Tìm user theo token
    const user = await Account.findOne({ token }).select("-password");
    if (!user) {
      return res.status(403).json({ code: 403, message: "Token không hợp lệ" });
    }

    // Lưu thông tin user vào res.locals để controller dùng
    res.locals.user = user;

    next(); 
  } catch (error) {
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ" });
  }
};
