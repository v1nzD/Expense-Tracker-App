import { Router } from "express";
import {
  addCategory,
  deleteCategory,
  getCategories,
} from "../controllers/category.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const categoryRouter = Router();

categoryRouter.use(protectRoute);

categoryRouter.get("/", getCategories);
categoryRouter.post("/", addCategory);
categoryRouter.delete("/:id", deleteCategory);

export default categoryRouter;
