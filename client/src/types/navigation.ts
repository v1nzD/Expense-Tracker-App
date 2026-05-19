import { Expense } from "../api/expenses";

export type RootStackParamList = {
  Tabs: undefined;
  AddExpense: { expense?: Expense } | undefined;
};
