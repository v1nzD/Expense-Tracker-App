import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { getExpenseSummary } from "../api/expenses";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "../constants/theme";
import { useAuthStore } from "../store/authStore";
import { CATEGORY_META } from "../constants/categories";
import FAB from "../components/FAB";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { useNavigation } from "@react-navigation/native";

// type NavigationProp = NativeStackNavigationProp<
//   AppStackParamList,
//   "AddExpense"
// >;

export default function HomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const { data } = useQuery({
    queryKey: ["expense-summary"],
    queryFn: getExpenseSummary,
  });

  const totalSpent = data?.total_spent || 0;
  const whole = Math.floor(totalSpent);
  const cents = "." + (totalSpent % 1).toFixed(2).slice(2);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HEADER ── */}
        <View
          className="relative overflow-hidden px-5 pb-[30px]"
          style={{
            backgroundColor: Colors.accent,
            paddingTop: 18,
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
          }}
        >
          {/* Decorative circles */}
          <View
            className="absolute -right-[30px] -top-[50px] h-[170px] w-[170px] rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.07)" }}
          />
          <View
            className="absolute -bottom-[20px] -left-[20px] h-[100px] w-[100px] rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
          />

          {/* Top row */}
          <View className="relative mb-[18px] flex-row items-center justify-between">
            <View>
              <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.65)" }}>
                Good morning,
              </Text>
              <Text style={{ fontSize: 15, fontWeight: "500", color: "white" }}>
                {user?.first_name} 👋
              </Text>
            </View>
            <View
              className="h-[34px] w-[34px] items-center justify-center rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
            >
              <Ionicons name="notifications" size={16} color="white" />
            </View>
          </View>

          {/* Total spent */}
          <View className="relative items-center">
            <Text
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.6)",
                marginBottom: 4,
              }}
            >
              Total spent this month
            </Text>
            <View className="flex-row items-end">
              <Text
                style={{
                  fontSize: 40,
                  fontWeight: "500",
                  color: "white",
                  letterSpacing: -2,
                  lineHeight: 44,
                }}
              >
                ${whole.toLocaleString()}
              </Text>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "500",
                  color: "white",
                  marginBottom: 2,
                }}
              >
                {cents}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.55)",
                marginTop: 5,
              }}
            >
              of $4,000 budget ·{" "}
              <Text style={{ color: "rgba(255,255,255,0.9)" }}>71% used</Text>
            </Text>
          </View>

          {/* Progress bar */}
          <View
            className="mt-[14px] h-[5px] overflow-hidden rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <View
              className="h-full rounded-full"
              style={{ width: "71%", backgroundColor: "white" }}
            />
          </View>
        </View>

        {/* ── BODY ── */}
        <View className="px-[15px] pt-[14px]">
          {/* Stat mini cards */}
          {/* todo: make stats dynamic */}
          <View className="flex-row gap-[7px] mb-[13px]">
            <View className="flex-1 rounded-[11px] bg-bg2 p-[10px]">
              <Text
                style={{ fontSize: 10, color: Colors.text3, marginBottom: 2 }}
              >
                Today
              </Text>
              <Text
                style={{ fontSize: 15, fontWeight: "500", color: Colors.text1 }}
              >
                $84
              </Text>
              <View
                className="mt-[3px] self-start rounded-full px-[7px] py-[2px]"
                style={{ backgroundColor: Colors.greenBg }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "500",
                    color: Colors.green,
                  }}
                >
                  3 items
                </Text>
              </View>
            </View>

            <View className="flex-1 rounded-[11px] bg-bg2 p-[10px]">
              <Text
                style={{ fontSize: 10, color: Colors.text3, marginBottom: 2 }}
              >
                This week
              </Text>
              <Text
                style={{ fontSize: 15, fontWeight: "500", color: Colors.text1 }}
              >
                $490
              </Text>
              <View
                className="mt-[3px] self-start rounded-full px-[7px] py-[2px]"
                style={{ backgroundColor: Colors.redBg }}
              >
                <Text
                  style={{ fontSize: 10, fontWeight: "500", color: Colors.red }}
                >
                  ▲ +12%
                </Text>
              </View>
            </View>

            <View className="flex-1 rounded-[11px] bg-bg2 p-[10px]">
              <Text
                style={{ fontSize: 10, color: Colors.text3, marginBottom: 2 }}
              >
                Saved
              </Text>
              <Text
                style={{ fontSize: 15, fontWeight: "500", color: Colors.green }}
              >
                $240
              </Text>
              <Text style={{ fontSize: 10, color: Colors.text3, marginTop: 3 }}>
                vs last mo
              </Text>
            </View>
          </View>

          {/* Insight card */}
          <View
            className="flex-row gap-[9px] rounded-[13px] p-[11px] mb-[13px]"
            style={{ backgroundColor: Colors.accentBg }}
          >
            <Text style={{ fontSize: 18, lineHeight: 22 }}>💡</Text>
            <View className="flex-1">
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "500",
                  color: Colors.accentDark,
                }}
              >
                Spending insight
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: Colors.accentDark,
                  opacity: 0.75,
                  marginTop: 2,
                }}
              >
                You spent 20% more on food this week vs. last week
              </Text>
            </View>
          </View>

          {/* By category header */}
          <View className="flex-row justify-between items-center mb-[10px]">
            <Text
              style={{ fontSize: 13, fontWeight: "500", color: Colors.text1 }}
            >
              By category
            </Text>
            <TouchableOpacity>
              <Text style={{ fontSize: 11, color: Colors.accent }}>
                See all
              </Text>
            </TouchableOpacity>
          </View>

          {/* Category rows */}
          <View className="flex-col gap-[9px]">
            {data?.by_category.map((cat) => {
              const meta =
                CATEGORY_META[cat.name ?? ""] ?? CATEGORY_META["Other"];
              return (
                <View
                  key={cat.name}
                  className="flex-row items-center gap-[9px]"
                >
                  <View
                    className="w-[36px] h-[36px] rounded-[11px] items-center justify-center"
                    style={{ backgroundColor: meta.color }}
                  >
                    <Text style={{ fontSize: 15 }}>{meta.icon}</Text>
                  </View>
                  <View className="flex-1">
                    <View className="flex-row justify-between mb-[4px]">
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "500",
                          color: Colors.text1,
                        }}
                      >
                        {cat.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "500",
                          color: Colors.text1,
                        }}
                      >
                        ${cat.total.toLocaleString()}
                      </Text>
                    </View>
                    <View
                      className="h-[4px] overflow-hidden rounded-full"
                      style={{ backgroundColor: Colors.bg3 }}
                    >
                      <View
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min((cat.total / (data?.total_spent || 1)) * 100, 100)}%`,
                          backgroundColor: Colors.accent,
                        }}
                      />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Add expense FAB */}
      <FAB onPress={() => navigation.navigate("AddExpense")} />

      <TouchableOpacity onPress={logout}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
