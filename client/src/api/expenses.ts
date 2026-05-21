import api from "./client";

export type Expense = {
  id: number;
  user_id: number;
  amount: string;
  category_id: number;
  category_name: string;
  description: string;
  expense_date: string;
  created_at: string;
  payment_method: "cash" | "card";
};

export type ExpenseResponse = {
  page: number;
  limit: number;
  total: number;
  data: Expense[];
};

export type ExpenseCategorySummary = {
  name: string;
  total: number;
};

type ExpenseFilters = {
  category_id?: number | null;
  start_date?: string | null;
  end_date?: string | null;
};

export type AddExpensePayload = {
  amount: number;
  category_id: number | null;
  description: string;
  expense_date: string;
  payment_method: "cash" | "card";
};

export type EditExpensePayload = {
  amount: string;
  category_id: number | null;
  description: string;
  expense_date: string;
  payment_method: "cash" | "card";
};

export type Category = {
  id: number;
  name: string;
};

export type ExpenseSummary = {
  total_spent: number;
  by_category: ExpenseCategorySummary[];
};

export const getExpenses = async (
  filters?: ExpenseFilters,
): Promise<ExpenseResponse> => {
  const res = await api.get<ExpenseResponse>("/expenses", { params: filters });
  return res.data;
};

export const getExpenseSummary = async (): Promise<ExpenseSummary> => {
  const res = await api.get<ExpenseSummary>("/expenses/summary");
  return res.data;
};

export const getCategories = async (): Promise<{ data: Category[] }> => {
  const res = await api.get<{ data: Category[] }>("/categories");
  return res.data;
};

export const addExpense = async (
  expense: AddExpensePayload,
): Promise<{ data: Expense }> => {
  const res = await api.post<{ data: Expense }>("/expenses", expense);
  return res.data;
};

export const editExpense = async (
  id: number,
  data: EditExpensePayload,
): Promise<Expense> => {
  const res = await api.put<Expense>(`/expenses/edit/${id}`, data);
  return res.data;
};

export const deleteExpense = async (id: number): Promise<void> => {
  await api.delete(`/expenses/delete/${id}`);
};
