import jwt from "jsonwebtoken";

export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null)
    return res.status(401).json({
      success: false,
      message: "No Authorization found!",
      error: err,
    });

  jwt.verify(token, process.env.SECRET, (err, user) => {
    if (err)
      return res.status(401).json({
        success: false,
        message: "Un Authorized",
      });
    req.user = user;
    next();
  });
}
