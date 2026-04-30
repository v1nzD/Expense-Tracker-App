import { Router } from "express";
import {
  addCategory,
  deleteCategory,
  getCategories,
} from "../controllers/category.controller";

const categoryRouter = Router();

categoryRouter.get("/", getCategories);
categoryRouter.post("/", addCategory);
categoryRouter.delete("/:id", deleteCategory);

export default categoryRouter;
