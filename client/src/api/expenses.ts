import api from "./client";

export type Expense = {
  id: number;
  user_id: number;
  amount: number;
  category_id: number;
  description: string;
  expense_date: string;
  created_at: string;
};

export type ExpenseResponse = {
  page: number;
  limit: number;
  total: number;
  data: Expense[];
};

export type Category = {
  name: string;
  total: number;
};

export type ExpenseSummary = {
  total_spent: number;
  by_category: Category[];
};

export const getExpenses = async (): Promise<ExpenseResponse> => {
  const res = await api.get<ExpenseResponse>("/expenses");
  return res.data;
};

export const getExpenseSummary = async (): Promise<ExpenseSummary> => {
  const res = await api.get<ExpenseSummary>("/expenses/summary");
  return res.data;
};
