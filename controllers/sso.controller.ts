import { NextFunction, Request, Response } from "express";
import config from "../configs/env";
import { redis } from "../configs/cache";
import authAPI from "../configs/axios/auth.axios";
import AuthError from "../errors/auth.error";

const validateSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const accessToken = req.cookies?.access_token as string | undefined;

    if (!accessToken) {
      res.status(401).json({
        success: false,
        message: "No access token found. User not authenticated",
      });
      return;
    }

    const cacheKey = `userinfo:${accessToken}`;
    const cachedUser = await redis.get(cacheKey);

    if (!cachedUser) {
      res.status(401).json({
        success: false,
        message: "No session established",
      });
      return;
    }

    res.status(200).json({
      success: true,
      userdata: JSON.parse(cachedUser),
    });
  } catch (err) {
    next(err);
  }
};

const fetchUserInfo = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const accessToken = req.cookies?.access_token as string | undefined;

    if (!accessToken) {
      throw new AuthError("Access token missing");
    }

    const cacheKey = `userinfo:${accessToken}`;
    const cachedUser = await redis.get(cacheKey);

    if (cachedUser) {
      res.status(200).json({
        success: true,
        userdata: JSON.parse(cachedUser),
      });
      return;
    }

    const userInfoResponse = await authAPI.get("/sso/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userData = userInfoResponse.data;

    await redis.setEx(
      cacheKey,
      Number(config.sessionTime),
      JSON.stringify(userData),
    );

    res.status(200).json({
      success: true,
      userdata: userData,
    });
  } catch (err) {
    next(err);
  }
};

const processAuthCode = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authorizationCode = req.query.code as string | undefined;

    if (!authorizationCode) {
      throw new AuthError("Authorization code missing");
    }

    const tokenResponse = await authAPI.post("/sso/token", {
      auth_code: authorizationCode,
      client_id: config.clientId,
      client_secret: config.authClientSecret,
      redirect_uri: config.tokenRedirectUrl,
      grant_type: "authorization_code",
    });

    const accessToken: string | undefined = tokenResponse.data?.access_token;

    if (!accessToken) {
      throw new AuthError("Access token not received from auth server");
    }

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: "lax",
      maxAge: config.authCookieMaxAge,
    });

    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const accessToken = req.cookies?.access_token as string | undefined;

    if (accessToken) {
      const cacheKey = `userinfo:${accessToken}`;
      await redis.del(cacheKey);
    }

    res.clearCookie("access_token", {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: "lax",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    next(err);
  }
};

export { processAuthCode, fetchUserInfo, validateSession, logout };
