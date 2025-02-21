import express from "express";
import { registerUser, loginUser } from "../controller/user.controller";

const router = express.Router();

router.post("/auth/signup", registerUser);
router.post("/auth/signin", loginUser);

export default router;
