import { Router } from "express";
import { addExpense, getExpenses } from "../controllers/expense.controller.js";
import { getExpenseSummary } from "../controllers/analytics.controller.js";

const expenseRouter = Router();

expenseRouter.post("/", addExpense);
expenseRouter.get("/", getExpenses);
expenseRouter.get("/summary", getExpenseSummary);

export default expenseRouter;
