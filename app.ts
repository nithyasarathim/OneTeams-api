import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";

import config from "./configs/env";
import requestLogger from "./middlewares/requestLogger";
import errorHandler from "./middlewares/errorHandler";
import SSORouter from "./routers/sso.router";

const app = express();

app.use(
  cors({
    origin: config.clientDomainUrl,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

app.use("/sso", SSORouter);

app.use(errorHandler);

export default app;
