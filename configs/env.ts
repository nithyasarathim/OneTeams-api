import dotenv from "dotenv";
import EnvError from "../errors/env.error";
dotenv.config();

interface Config {
  port: Number;
  authClientUrl: string;
  authServerUrl: string;
  databaseServerUrl: string;
  cacheServerUrl: string;
  windowMs: number;
  clientDomainUrl: string;
  clientId: string;
  authClientSecret: string;
  tokenRedirectUrl: string;
  authCookieMaxAge: number;
  nodeEnv: string;
}

const requireEnv = (value: string): string => {
  const ENV_VALUE = process.env[value];
  if (!ENV_VALUE) {
    throw new EnvError(
      `[CONFIGURATION ERROR]: ${value} is not defined in Environment`,
    );
  }
  return ENV_VALUE;
};

const config: Config = {
  port: Number(requireEnv("ONE_TEAMS_SERVER_PORT")),
  authClientUrl: requireEnv("ONE_AUTH_CLIENT_URL"),
  authServerUrl: requireEnv("ONE_AUTH_SERVER_URL"),
  databaseServerUrl: requireEnv("ONE_TEAMS_DATABASE_SERVER_URL"),
  cacheServerUrl: requireEnv("ONE_TEAMS_CACHE_SERVER_URL"),
  clientDomainUrl: requireEnv("ONE_TEAMS_CLIENT_DOMAIN_URL"),
  windowMs: Number(requireEnv("ONE_TEAMS_RATE_LIMIT_WINDOW_SIZE")),
  clientId: requireEnv("ONE_TEAMS_CLIENT_ID"),
  authClientSecret: requireEnv("ONE_AUTH_SERVER_TO_SERVER_SECRET"),
  tokenRedirectUrl: requireEnv("ONE_AUTH_TOKEN_REDIRECT_URL"),
  authCookieMaxAge: Number(requireEnv("ONE_TEAMS_AUTH_COOKIE_MAX_AGE")),
  nodeEnv: requireEnv("NODE_ENVIRONMENT"),
};

export default config;
