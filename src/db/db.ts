import * as schema from "./schema";
import { sql } from "@vercel/postgres";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
export const db = drizzle(sql, { schema });
// import { drizzle } from "drizzle-orm/postgres-js";
// const client = postgres(process.env.POSTGRES_URL!);
// export const db = drizzle(client, { schema });

//TODO: When push to prod change above
