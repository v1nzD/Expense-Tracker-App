import { Router } from "express";
import {
  addCategory,
  deleteCategory,
  getCategories,
  seedDefaultCategories,
} from "../controllers/category.controller";

const categoryRouter = Router();

categoryRouter.get("/", getCategories);
categoryRouter.post("/", addCategory);
categoryRouter.delete("/:id", deleteCategory);
categoryRouter.post("/seed", seedDefaultCategories);

export default categoryRouter;
