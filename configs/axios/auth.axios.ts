import axios from "axios";
import config from "../env";

const AUTH_SERVER_URL = config.authServerUrl;

const authAPI = axios.create({
  baseURL: AUTH_SERVER_URL,
  timeout: 10000,
});

export default authAPI;
