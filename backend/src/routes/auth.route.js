import { Router } from "express";
import { loginUser, registerUser } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const authRouter = Router();

authRouter.use(protectRoute);

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);

export default authRouter;
