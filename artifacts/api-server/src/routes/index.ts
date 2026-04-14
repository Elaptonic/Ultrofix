import { Router, type IRouter } from "express";
import bookingsRouter from "./bookings";
import healthRouter from "./health";
import notificationsRouter from "./notifications";
import paymentsRouter from "./payments";
import profileRouter from "./profile";
import providersRouter from "./providers";
import servicesRouter from "./services";

const router: IRouter = Router();

router.use(healthRouter);
router.use(servicesRouter);
router.use(providersRouter);
router.use(bookingsRouter);
router.use(profileRouter);
router.use(notificationsRouter);
router.use(paymentsRouter);

export default router;
