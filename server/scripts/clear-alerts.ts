import "dotenv/config";
import { db } from "../db";
import { alerts } from "../db/schema";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Clearing alerts table...");
    await db.delete(alerts);
    // Reset sequence if needed (for ID 1, 2, 3...)
    await db.execute(sql`TRUNCATE TABLE alerts RESTART IDENTITY`);
    console.log("Alerts cleared and ID reset.");
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
