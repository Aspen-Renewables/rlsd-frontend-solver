import * as schema from "./schema";
import { sql } from "@vercel/postgres";
import postgres from "postgres";
import { drizzle as drizzleVercel } from "drizzle-orm/vercel-postgres";
import { drizzle as drizzlePG } from "drizzle-orm/postgres-js";
const client = postgres(process.env.POSTGRES_URL!);

const getDB = () => {
  //Drizzle Verecl Only Works On Vercel Environment
  console.log(process.env.NODE_ENV);
  if (process.env.DRIZZLE_STATE == "local") {
    console.log("Using Drizzle PG");
    //log the connection string
    return drizzlePG(client, { schema });
  } else {
    return drizzleVercel(sql, { schema });
  }
};
export const db = getDB();
