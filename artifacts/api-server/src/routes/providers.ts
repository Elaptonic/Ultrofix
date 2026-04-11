import { db, providersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/providers", async (req, res): Promise<void> => {
  const { category } = req.query;
  const rows = await (category
    ? db.select().from(providersTable).where(eq(providersTable.category, String(category)))
    : db.select().from(providersTable));
  res.json(rows);
});

export default router;
