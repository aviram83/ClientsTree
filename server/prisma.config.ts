import { defineConfig, env } from "@prisma/config";
import * as dotenv from "dotenv";

dotenv.config({ path: [".env.development", ".env.production", ".env"] });

export default defineConfig({
  datasource: {
    url: env("DATABASE_URL"),
  },
});