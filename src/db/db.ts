import * as schema from "./schema";
import { sql } from "@vercel/postgres";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
// import { drizzle } from "drizzle-orm/postgres-js";
// const client = postgres(process.env.POSTGRES_URL!);
// export const db = drizzle(client, { schema });
export const db = drizzle(sql, { schema });

//TODO: When push to prod change above
