import {
  View,
  Text,
  FlatList,
  SectionList,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Category,
  deleteExpense,
  Expense,
  ExpenseResponse,
  getCategories,
  getExpenses,
} from "../api/expenses";
import { CATEGORY_META } from "../constants/categories";
import { Colors } from "../constants/theme";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Ionicons from "@expo/vector-icons/Ionicons";
import FAB from "../components/FAB";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Swipeable } from "react-native-gesture-handler";
import { RootStackParamList } from "../types/navigation";

// type NavigationProp = NativeStackNavigationProp<
//   RootStackParamList,
//   "AddExpense"
// >;

const groupExpensesByDate = (expenses: Expense[]) => {
  const groups: { [key: string]: Expense[] } = {};

  expenses.forEach((expense) => {
    const date = new Date(expense.expense_date);
    const dateKey = date.toDateString(); // "Sat May 10 2026"
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(expense);
  });

  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  return Object.entries(groups).map(([dateKey, data]) => {
    let title = "";
    if (dateKey === today) {
      title = `TODAY · ${new Date(dateKey).toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase()}`;
    } else if (dateKey === yesterday) {
      title = `YESTERDAY · ${new Date(dateKey).toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase()}`;
    } else {
      title = new Date(dateKey)
        .toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
        .toUpperCase();
    }
    return { title, data };
  });
};

export default function ExpensesScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const queryClient = useQueryClient();

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [pickerMode, setPickerMode] = useState<"start" | "end" | null>(null);

  const {
    data: expenses,
    isLoading: expensesLoading,
    isError: expensesError,
  } = useQuery<ExpenseResponse>({
    queryKey: ["expenses", selectedCategory, startDate, endDate],
    queryFn: () =>
      getExpenses({
        category_id: selectedCategory,
        start_date: startDate,
        end_date: endDate,
      }),
  });

  const {
    data: categories,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useQuery<{ data: Category[] }>({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { mutate: deleteExpenseMutate, isPending: isDeleteExpensePending } =
    useMutation({
      mutationFn: deleteExpense,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["expenses"] });
        queryClient.invalidateQueries({ queryKey: ["expense-summary"] });
        navigation.goBack();
      },
    });

  // data
  const sections = groupExpensesByDate(expenses?.data || []);

  const handleDeleteExpense = (expenseId: number) => {
    Alert.alert(
      "Delete Expense",
      `Are you sure you want to delete this expense?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteExpenseMutate(expenseId),
        },
      ],
    );
  };

  const renderRightActions = (item: Expense) => (
    <View className="flex-row">
      {/* Edit action */}
      <TouchableOpacity
        onPress={() => navigation.navigate("AddExpense", { expense: item })}
        style={{
          backgroundColor: Colors.accentBg,
          justifyContent: "center",
          alignItems: "center",
          width: 70,
        }}
      >
        <Ionicons name="pencil-outline" size={18} color={Colors.accent} />
        <Text style={{ fontSize: 10, color: Colors.accent, marginTop: 3 }}>
          Edit
        </Text>
      </TouchableOpacity>

      {/* Delete action */}
      <TouchableOpacity
        onPress={() => handleDeleteExpense(item.id)}
        style={{
          backgroundColor: Colors.redBg,
          justifyContent: "center",
          alignItems: "center",
          width: 70,
        }}
      >
        <Ionicons name="trash-outline" size={18} color={Colors.red} />
        <Text style={{ fontSize: 10, color: Colors.red, marginTop: 3 }}>
          Delete
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Render expenses for SectionList
  const renderExpenses = ({ item }: { item: Expense }) => {
    const category =
      CATEGORY_META[item.category_name ?? ""] ?? CATEGORY_META["Other"];
    return (
      <Swipeable renderRightActions={() => renderRightActions(item)}>
        <View
          className="flex-row items-center gap-[9px] px-[15px] py-[11px] rounded-[13px] mb-2 mx-[15px]"
          style={{ backgroundColor: Colors.bg2 }}
        >
          {/* Category icon */}
          <View
            className="w-[36px] h-[36px] rounded-[11px] items-center justify-center "
            style={{ backgroundColor: category.color }}
          >
            <Text style={{ fontSize: 15 }}>{category.icon}</Text>
          </View>

          {/* Expense info */}
          <View className="flex-1">
            <Text
              style={{ fontSize: 13, fontWeight: "500", color: Colors.text1 }}
            >
              {item.description}
            </Text>
            <Text style={{ fontSize: 11, color: Colors.text3, marginTop: 2 }}>
              {item.category_name ?? "Uncategorised"} ·{" "}
              {new Date(item.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>

          {/* Amount */}
          <Text
            style={{ fontSize: 14, fontWeight: "500", color: Colors.text1 }}
          >
            -${parseFloat(item.amount).toFixed(2)}
          </Text>
        </View>
      </Swipeable>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      {/* Header */}
      <View className="px-[15px] pt-[14px] pb-[11px]">
        <Text
          className="text-2xl"
          style={{
            fontWeight: "500",
            color: Colors.text1,
            marginBottom: 11,
          }}
        >
          Expenses
        </Text>
      </View>

      {/* Date range row */}
      <View
        style={{
          flexDirection: "row",
          gap: 7,
          alignItems: "center",
          paddingHorizontal: 15,
          marginBottom: 11,
        }}
      >
        {/* Start date */}
        <TouchableOpacity
          onPress={() => setPickerMode("start")}
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            backgroundColor: Colors.bg2,
            borderWidth: 0.5,
            borderColor: Colors.border2,
            borderRadius: 11,
            padding: 8,
            paddingHorizontal: 11,
          }}
        >
          <Ionicons name="calendar-outline" size={13} color={Colors.accent} />
          <Text
            style={{
              fontSize: 11.5,
              fontWeight: "500",
              color: Colors.text1,
              flex: 1,
            }}
          >
            {startDate
              ? new Date(startDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Start date"}
          </Text>
          <Ionicons name="chevron-down" size={10} color={Colors.text3} />
        </TouchableOpacity>

        <Text style={{ fontSize: 11, color: Colors.text3 }}>→</Text>

        {/* End date */}
        <TouchableOpacity
          onPress={() => setPickerMode("end")}
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            backgroundColor: Colors.bg2,
            borderWidth: 0.5,
            borderColor: Colors.border2,
            borderRadius: 11,
            padding: 8,
            paddingHorizontal: 11,
          }}
        >
          <Ionicons name="calendar-outline" size={13} color={Colors.accent} />
          <Text
            style={{
              fontSize: 11.5,
              fontWeight: "500",
              color: Colors.text1,
              flex: 1,
            }}
          >
            {endDate
              ? new Date(endDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "End date"}
          </Text>
          <Ionicons name="chevron-down" size={10} color={Colors.text3} />
        </TouchableOpacity>
      </View>

      {/* Date picker modal */}
      <DateTimePickerModal
        isVisible={pickerMode !== null}
        mode="date"
        display="inline"
        themeVariant="light"
        onConfirm={(date) => {
          const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          if (pickerMode === "start") setStartDate(formatted);
          else setEndDate(formatted);
          setPickerMode(null);
        }}
        onCancel={() => setPickerMode(null)}
      />

      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, minHeight: 42 }}
        contentContainerStyle={{
          paddingHorizontal: 15,
          gap: 7,
          alignItems: "center",
        }}
      >
        {/* All tab */}
        <TouchableOpacity
          onPress={() => setSelectedCategory(null)}
          style={{
            paddingHorizontal: 13,
            paddingVertical: 6,
            borderRadius: 100,
            backgroundColor:
              selectedCategory === null ? Colors.accent : Colors.bg2,
            borderWidth: 0.5,
            borderColor:
              selectedCategory === null ? Colors.accent : Colors.border2,
          }}
        >
          <Text
            style={{
              fontSize: 11.5,
              fontWeight: "500",
              color: selectedCategory === null ? "white" : Colors.text2,
            }}
          >
            All
          </Text>
        </TouchableOpacity>

        {/* Rest of the categories */}
        {categories?.data.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => setSelectedCategory(cat.id)}
            style={{
              paddingHorizontal: 13,
              paddingVertical: 6,
              borderRadius: 100,
              backgroundColor:
                selectedCategory === cat.id ? Colors.accent : Colors.bg2,
              borderWidth: 0.5,
              borderColor:
                selectedCategory === cat.id ? Colors.accent : Colors.border2,
            }}
          >
            <Text
              style={{
                fontSize: 11.5,
                fontWeight: "500",
                color: selectedCategory === cat.id ? "white" : Colors.text2,
              }}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Expenses list */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderExpenses}
        renderSectionHeader={({ section: { title } }) => (
          <Text
            style={{
              fontSize: 10,
              color: Colors.text3,
              fontWeight: "500",
              letterSpacing: 0.7,
              marginBottom: 4,
              marginTop: 10,
              paddingHorizontal: 15,
            }}
          >
            {title}
          </Text>
        )}
        SectionSeparatorComponent={() => <View style={{ height: 6 }} />}
        contentContainerStyle={{ paddingVertical: 10, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Add expense FAB */}
      <FAB onPress={() => navigation.navigate("AddExpense")} />
    </SafeAreaView>
  );
}
