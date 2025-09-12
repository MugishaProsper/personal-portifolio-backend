import dotenv from "dotenv";

let loaded = false;
export const loadEnv = () => {
  if (loaded) return;
  dotenv.config();
  loaded = true;
};

export const required = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};


