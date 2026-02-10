import { Request } from "express";

const getTokenFrom = (request: Request<any>) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    return authorization.replace("Bearer ", "");
  }
  return null;
};

export default { getTokenFrom };
