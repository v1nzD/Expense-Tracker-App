import { Router } from "express";
import { addExpense, getExpenses } from "../controllers/expense.controller.js";

const expenseRouter = Router();

expenseRouter.post("/", addExpense);
expenseRouter.get("/", getExpenses);

export default expenseRouter;
