import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "../constants/theme";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addExpense,
  Category,
  editExpense,
  EditExpensePayload,
  Expense,
  getCategories,
} from "../api/expenses";
import { CATEGORY_META } from "../constants/categories";
import { useNavigation, useRoute } from "@react-navigation/native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function AddExpenseScreen() {
  // for editing expense
  const route = useRoute<any>();
  const expenseToEdit = route.params?.expense;
  const isEditing = !!expenseToEdit;

  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState("0");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [description, setDescription] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("card");

  const { data: categories } = useQuery<{ data: Category[] }>({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { mutate: addExpenseMutate, isPending: isAddingExpensePending } =
    useMutation({
      mutationFn: addExpense,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["expenses"] });
        queryClient.invalidateQueries({ queryKey: ["expense-summary"] });
        navigation.goBack();
      },
      onError: (error: any) => {
        Alert.alert(
          "Error",
          error?.response?.data?.error || "Something went wrong",
        );
      },
    });

  const { mutate: editExpenseMutate, isPending: isEditExpensePending } =
    useMutation({
      mutationFn: ({ id, data }: { id: number; data: EditExpensePayload }) =>
        editExpense(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["expenses"] });
        queryClient.invalidateQueries({ queryKey: ["expense-summary"] });
        navigation.goBack();
      },
      onError: (error: any) => {
        Alert.alert(
          "Error",
          error?.response?.data?.error || "Something went wrong",
        );
      },
    });

  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const handleSaveExpense = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    addExpenseMutate({
      amount: parseFloat(amount),
      category_id: selectedCategory?.id ?? null,
      description,
      expense_date: date.toISOString().split("T")[0],
      payment_method: paymentMethod,
    });
  };

  const handleEditExpense = (expense: Expense) => {
    editExpenseMutate({
      id: expense.id,
      data: {
        amount,
        category_id: selectedCategory?.id ?? null,
        description,
        expense_date: date.toISOString().split("T")[0],
        payment_method: paymentMethod,
      },
    });
  };

  useEffect(() => {
    if (expenseToEdit) {
      setAmount(expenseToEdit.amount.toString());
      setDescription(expenseToEdit.description ?? "");
      setDate(new Date(expenseToEdit.expense_date));
      setPaymentMethod(expenseToEdit.payment_method ?? "card");
    }
  }, []);

  useEffect(() => {
    if (expenseToEdit && categories?.data) {
      const cat = categories.data.find(
        (c) => c.id === expenseToEdit.category_id,
      );
      setSelectedCategory(cat ?? null);
    }
  }, [categories]);

  return (
    <View className="flex-1 bg-bg">
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-[16px]"
        style={{ paddingTop: 12, marginBottom: 4 }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 20, color: Colors.text3 }}>✕</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 15, fontWeight: "500", color: Colors.text1 }}>
          {isEditing ? "Edit expense" : "Add expense"}
        </Text>

        {/* Save btn */}
        <TouchableOpacity
          onPress={
            isEditing
              ? () => handleEditExpense(expenseToEdit)
              : handleSaveExpense
          }
          disabled={isAddingExpensePending || isEditExpensePending}
        >
          <Text
            style={{ fontSize: 13, fontWeight: "500", color: Colors.accent }}
          >
            {isAddingExpensePending || isEditExpensePending
              ? "Saving..."
              : isEditing
                ? "Update"
                : "Save"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Amount card */}
        <View className="mx-[15px] my-[16px] rounded-[18px] p-[20px] items-center">
          <Text style={{ fontSize: 11, color: Colors.text3, marginBottom: 6 }}>
            Amount
          </Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            style={{
              fontSize: 46,
              fontWeight: "500",
              color: Colors.accent,
              letterSpacing: -2,
              textAlign: "center",
              minWidth: 100,
            }}
            placeholder="0"
            placeholderTextColor={Colors.accentMid}
          />
          <Text style={{ fontSize: 11, color: Colors.accentMid, marginTop: 5 }}>
            Tap to edit
          </Text>
        </View>

        {/* Body */}
        <View className="px-[15px]">
          {/* Category label */}
          <Text
            style={{
              fontSize: 11,
              color: Colors.text3,
              fontWeight: "500",
              letterSpacing: 0.6,
              marginBottom: 9,
            }}
          >
            CATEGORY
          </Text>

          {/* Category chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories?.data.map((cat) => {
              const meta = CATEGORY_META[cat.name] ?? CATEGORY_META["Other"];

              const isSelected = selectedCategory?.id === cat.id;

              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat)}
                  className="items-center mr-1"
                  style={{ width: 90 }}
                >
                  {/* Icon Button */}
                  <View
                    className="w-20 h-20 rounded-3xl items-center justify-center"
                    style={{
                      backgroundColor: isSelected
                        ? Colors.accentMid
                        : meta.color,
                    }}
                  >
                    <Text className="text-3xl">{meta.icon}</Text>
                  </View>

                  {/* Label outside */}
                  <Text
                    className="mt-2 text-[10px] font-medium text-center"
                    style={{
                      color: isSelected ? Colors.accentDark : "#374151",
                    }}
                  >
                    {cat.name.split(" ")[0]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Description input */}
          <TextInput
            placeholder="Description"
            placeholderTextColor={Colors.text3}
            value={description}
            onChangeText={setDescription}
            // showSoftInputOnFocus={false}
            className="mt-[12px] mb-[8px]"
            style={{
              fontSize: 13,
              color: Colors.text1,
              backgroundColor: Colors.bg2,
              borderRadius: 11,
              paddingHorizontal: 14,
              paddingVertical: 14,
              borderWidth: 0.5,
              borderColor: Colors.border,
            }}
          />

          {/* Recurring toggle */}
          <View
            className="flex-row justify-between items-center py-[12px]"
            style={{ borderBottomWidth: 0.5, borderBottomColor: Colors.border }}
          >
            <View>
              <Text
                style={{ fontSize: 13, fontWeight: "500", color: Colors.text1 }}
              >
                Recurring expense
              </Text>
              <Text style={{ fontSize: 11, color: Colors.text3 }}>
                Repeat on a schedule
              </Text>
            </View>
            <Switch
              value={isRecurring}
              onValueChange={setIsRecurring}
              trackColor={{ false: Colors.bg3, true: Colors.accentMid }}
              thumbColor={isRecurring ? Colors.accent : Colors.text3}
            />
          </View>

          {/* Date row */}
          <TouchableOpacity
            className="flex-row justify-between items-center py-[12px]"
            style={{ borderBottomWidth: 0.5, borderBottomColor: Colors.border }}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={{ fontSize: 13, color: Colors.text2 }}>Date</Text>
            <Text
              style={{ fontSize: 13, fontWeight: "500", color: Colors.accent }}
            >
              {formattedDate}
            </Text>
          </TouchableOpacity>

          {/* Payment method */}
          <View className="py-[12px]">
            <Text
              style={{ fontSize: 13, color: Colors.text2, marginBottom: 9 }}
            >
              Payment method
            </Text>
            <View className="flex-row gap-[9px]">
              {(["card", "cash"] as const).map((method) => (
                <TouchableOpacity
                  key={method}
                  onPress={() => setPaymentMethod(method)}
                  className="flex-1 flex-row items-center justify-center gap-[7px] py-[10px] rounded-[11px]"
                  style={{
                    backgroundColor:
                      paymentMethod === method ? Colors.accentBg : Colors.bg2,
                    borderWidth: 0.5,
                    borderColor:
                      paymentMethod === method ? Colors.accent : Colors.border,
                  }}
                >
                  <Ionicons
                    name={method === "card" ? "card-outline" : "cash-outline"}
                    size={15}
                    color={
                      paymentMethod === method ? Colors.accent : Colors.text3
                    }
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "500",
                      color:
                        paymentMethod === method
                          ? Colors.accentDark
                          : Colors.text2,
                      textTransform: "capitalize",
                    }}
                  >
                    {method}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Date picker modal */}
      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        display="inline"
        themeVariant="light"
        onConfirm={(d) => {
          setDate(d);
          setShowDatePicker(false);
        }}
        onCancel={() => setShowDatePicker(false)}
      />
    </View>
  );
}
