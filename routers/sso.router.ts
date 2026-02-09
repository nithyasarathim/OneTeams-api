import { Router } from "express";
import limitrate from "../middlewares/rateLimiter";
import { processAuthCode, fetchUserInfo } from "../controllers/sso.controller";

const SSORouter = Router();

SSORouter.get("/code", processAuthCode);
SSORouter.get("/user", fetchUserInfo);

export default SSORouter;
