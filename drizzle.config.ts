import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://postgres.wyqnsnyyuvrsfufnuiuz:Kartik9518602040@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres",
  },
});
