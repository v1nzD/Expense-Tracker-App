import { Router } from "express";
import {
  addExpense,
  deleteExpense,
  editExpense,
  getExpenses,
} from "../controllers/expense.controller.js";
import {
  getExpensesMonthly,
  getExpenseSummary,
} from "../controllers/analytics.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const expenseRouter = Router();

expenseRouter.use(protectRoute);

expenseRouter.post("/", addExpense);
expenseRouter.get("/", getExpenses);
expenseRouter.get("/summary", getExpenseSummary);
expenseRouter.get("/monthly", getExpensesMonthly);
expenseRouter.put("/edit/:id", editExpense);
expenseRouter.delete("/delete/:id", deleteExpense);

export default expenseRouter;
