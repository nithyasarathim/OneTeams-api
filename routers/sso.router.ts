import { Router } from "express";
import limitrate from "../middlewares/rateLimiter";
import {
  processAuthCode,
  fetchUserInfo,
  validateSession,
} from "../controllers/sso.controller";

const SSORouter = Router();

SSORouter.get("/code", processAuthCode);
SSORouter.get("/user", fetchUserInfo);
SSORouter.get("/validate", validateSession);

export default SSORouter;
