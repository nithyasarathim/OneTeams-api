import { Router } from "express";
import {
  processAuthCode,
  fetchUserInfo,
  validateSession,
  logout
} from "../controllers/sso.controller";

const SSORouter = Router();

SSORouter.get("/code", processAuthCode);
SSORouter.get("/user", fetchUserInfo);
SSORouter.get("/validate", validateSession);
SSORouter.get("/logout", logout);

export default SSORouter;
