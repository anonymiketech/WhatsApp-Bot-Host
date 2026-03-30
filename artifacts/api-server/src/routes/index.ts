import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import botsRouter from "./bots";
import usersRouter from "./users";
import paymentsRouter from "./payments";
import partnersRouter from "./partners";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(botsRouter);
router.use(usersRouter);
router.use(paymentsRouter);
router.use(partnersRouter);

export default router;
