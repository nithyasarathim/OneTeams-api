import { NextFunction, Request, Response } from "express";
import config from "../configs/env";
import { redis } from "../configs/cache";
import authAPI from "../configs/axios/auth.axios";
import AuthError from "../errors/auth.error";

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

    const cachedUser: string | null = await redis.get(cacheKey);

    if (cachedUser) {
      res.status(200).json({
        success: true,
        userdata: JSON.parse(cachedUser),
      });
      return;
    }

    const userInfoResponse = await authAPI.get("sso/userinfo", {
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
    const authorizationCode = req.query.code as string;

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

export { processAuthCode, fetchUserInfo };
