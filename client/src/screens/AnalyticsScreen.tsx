import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { PieChart, BarChart } from "react-native-gifted-charts";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getExpenses, getExpensesMonthly } from "../api/expenses";
import { CATEGORY_META } from "../constants/categories";
import { Colors } from "../constants/theme";

type Period = "week" | "month" | "year";

const PERIOD_LABEL: Record<Period, string> = {
  week: "Last 7 days",
  month: "This month",
  year: "This year",
};

// CATEGORY_META now carries a saturated ringColor per default category
// (see constants/categories.ts), so charts and icon chips stay visually
// consistent. FALLBACK_PALETTE only kicks in for a category a user created
// themselves via addCategory, which won't have a CATEGORY_META entry.
const FALLBACK_PALETTE = [
  "#F97316",
  "#3B82F6",
  "#A855F7",
  "#EC4899",
  "#22C55E",
  "#EAB308",
  "#06B6D4",
  "#6366F1",
  "#D97706",
  "#94A3B8",
];

function getChartColor(categoryName: string) {
  const fromMeta = CATEGORY_META[categoryName]?.ringColor;
  if (fromMeta) return fromMeta;
  // Deterministic hash so the same unrecognized category always gets the
  // same color, rather than a random one on every render.
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    hash = (hash * 31 + categoryName.charCodeAt(i)) >>> 0;
  }
  return FALLBACK_PALETTE[hash % FALLBACK_PALETTE.length];
}

const cardStyle = {
  backgroundColor: Colors.bg,
  borderRadius: 20,
  padding: 16,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 10,
  elevation: 2,
};

// ---- date helpers ----
const formatDateForApi = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

function getPeriodRange(period: Period) {
  const now = new Date();
  const end = formatDateForApi(now);
  let start: Date;
  if (period === "week") {
    start = new Date(now);
    start.setDate(start.getDate() - 6);
  } else if (period === "month") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    start = new Date(now.getFullYear(), 0, 1);
  }
  return { start_date: formatDateForApi(start), end_date: end };
}

function getPreviousPeriodRange(period: Period) {
  const now = new Date();
  if (period === "week") {
    const end = new Date(now);
    end.setDate(end.getDate() - 7);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    return {
      start_date: formatDateForApi(start),
      end_date: formatDateForApi(end),
    };
  }
  if (period === "month") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return {
      start_date: formatDateForApi(start),
      end_date: formatDateForApi(end),
    };
  }
  const start = new Date(now.getFullYear() - 1, 0, 1);
  const end = new Date(now.getFullYear() - 1, 11, 31);
  return {
    start_date: formatDateForApi(start),
    end_date: formatDateForApi(end),
  };
}

function getLast7DayRange() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - 6);
  return {
    start_date: formatDateForApi(start),
    end_date: formatDateForApi(now),
  };
}

const sumAmounts = (rows?: { amount: string }[]) =>
  (rows ?? []).reduce((sum, r) => sum + parseFloat(r.amount), 0);

export default function AnalyticsScreen() {
  const [period, setPeriod] = useState<Period>("month");

  const periodRange = useMemo(() => getPeriodRange(period), [period]);
  const previousRange = useMemo(() => getPreviousPeriodRange(period), [period]);

  // ----- Current + previous period totals (drives the hero card + trend) -----
  const { data: periodExpenses, isLoading: periodLoading } = useQuery({
    queryKey: ["expenses", "analytics-period", period],
    queryFn: () => getExpenses({ ...periodRange, limit: 500 }),
  });

  const { data: previousExpenses } = useQuery({
    queryKey: ["expenses", "analytics-period-prev", period],
    queryFn: () => getExpenses({ ...previousRange, limit: 500 }),
  });

  const categoryTotals = useMemo(() => {
    if (!periodExpenses?.data) return [];
    const map = new Map<string, number>();
    periodExpenses.data.forEach((e) => {
      const name = e.category_name ?? "Uncategorised";
      map.set(name, (map.get(name) ?? 0) + parseFloat(e.amount));
    });
    return Array.from(map.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }, [periodExpenses]);

  const periodTotal = categoryTotals.reduce((sum, c) => sum + c.total, 0);
  const previousTotal = sumAmounts(previousExpenses?.data);
  const trendPct =
    previousTotal > 0
      ? ((periodTotal - previousTotal) / previousTotal) * 100
      : null;

  // Cap the ring/legend at top 4 + "Other"
  const displayCategories = useMemo(() => {
    if (categoryTotals.length <= 5) return categoryTotals;
    const top = categoryTotals.slice(0, 4);
    const rest = categoryTotals.slice(4).reduce((sum, c) => sum + c.total, 0);
    return [...top, { name: "Other", total: rest }];
  }, [categoryTotals]);

  const pieData = useMemo(
    () =>
      displayCategories.map((c) => ({
        value: c.total,
        color: getChartColor(c.name),
        text: c.name,
      })),
    [displayCategories],
  );

  // ----- Daily spending, always last 7 days -----
  const last7Range = useMemo(() => getLast7DayRange(), []);
  const { data: weekExpenses, isLoading: weekLoading } = useQuery({
    queryKey: ["expenses", "analytics-last7"],
    queryFn: () => getExpenses({ ...last7Range, limit: 500 }),
  });

  const dailyTotals = useMemo(() => {
    const days: { date: Date; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({ date: d, total: 0 });
    }
    weekExpenses?.data.forEach((e) => {
      const d = new Date(e.expense_date);
      const match = days.find(
        (day) => day.date.toDateString() === d.toDateString(),
      );
      if (match) match.total += parseFloat(e.amount);
    });
    return days;
  }, [weekExpenses]);

  const barData = useMemo(
    () =>
      dailyTotals.map((d, i) => {
        const isToday = i === dailyTotals.length - 1;
        return {
          value: Number(d.total.toFixed(2)),
          label: d.date.toLocaleDateString("en-US", { weekday: "short" })[0],
          frontColor: isToday ? Colors.accent : Colors.accentMid,
          labelTextStyle: {
            color: isToday ? Colors.accent : Colors.text3,
            fontSize: 10,
            fontWeight: isToday ? ("500" as const) : ("400" as const),
          },
        };
      }),
    [dailyTotals],
  );

  // ----- Month over month mini cards -----
  const { data: monthly } = useQuery({
    queryKey: ["expenses-monthly"],
    queryFn: getExpensesMonthly,
  });

  const monthCards = useMemo(() => {
    if (!monthly || monthly.length === 0) return [];
    const sorted = [...monthly].sort((a, b) => a.month.localeCompare(b.month));
    return sorted.slice(-3).map((m, i, arr) => ({
      label: new Date(`${m.month}-01T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
      }),
      total: Number(m.total),
      isCurrent: i === arr.length - 1,
    }));
  }, [monthly]);

  const momPct = useMemo(() => {
    if (monthCards.length < 2) return null;
    const current = monthCards[monthCards.length - 1].total;
    const previous = monthCards[monthCards.length - 2].total;
    if (previous <= 0) return null;
    return ((current - previous) / previous) * 100;
  }, [monthCards]);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 15,
          paddingTop: 12,
          paddingBottom: 100,
        }}
      >
        {/* Header */}
        <Text
          style={{
            fontSize: 20,
            fontWeight: "500",
            color: Colors.text1,
            marginBottom: 14,
          }}
        >
          Analytics
        </Text>

        {/* Segmented control */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: Colors.bg2,
            borderRadius: 12,
            padding: 4,
            gap: 3,
            marginBottom: 16,
          }}
        >
          {(["week", "month", "year"] as Period[]).map((p) => {
            const isOn = period === p;
            return (
              <TouchableOpacity
                key={p}
                onPress={() => setPeriod(p)}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 9,
                  alignItems: "center",
                  backgroundColor: isOn ? Colors.bg : "transparent",
                  ...(isOn
                    ? {
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.06,
                        shadowRadius: 3,
                        elevation: 1,
                      }
                    : {}),
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: isOn ? Colors.accent : Colors.text2,
                    fontWeight: isOn ? "500" : "400",
                    textTransform: "capitalize",
                  }}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Hero summary card */}
        <View
          style={{
            backgroundColor: Colors.accent,
            borderRadius: 24,
            padding: 20,
            marginBottom: 16,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              position: "absolute",
              top: -50,
              right: -30,
              width: 170,
              height: 170,
              borderRadius: 85,
              backgroundColor: "rgba(255,255,255,0.07)",
            }}
          />
          <View
            style={{
              position: "absolute",
              bottom: -20,
              left: -20,
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: "rgba(255,255,255,0.05)",
            }}
          />
          <Text
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.7)",
              marginBottom: 6,
            }}
          >
            {PERIOD_LABEL[period]}
          </Text>
          <Text
            style={{
              fontSize: 34,
              fontWeight: "500",
              color: "white",
              letterSpacing: -1,
              marginBottom: 8,
            }}
          >
            $
            {periodTotal.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </Text>
          {trendPct !== null && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                alignSelf: "flex-start",
                gap: 4,
                backgroundColor: "rgba(255,255,255,0.18)",
                borderRadius: 100,
                paddingHorizontal: 9,
                paddingVertical: 4,
              }}
            >
              <Ionicons
                name={trendPct <= 0 ? "arrow-down" : "arrow-up"}
                size={11}
                color="white"
              />
              <Text style={{ fontSize: 11, fontWeight: "500", color: "white" }}>
                {Math.abs(trendPct).toFixed(0)}% vs previous period
              </Text>
            </View>
          )}
        </View>

        {/* Spending by category card */}
        <View style={{ ...cardStyle, marginBottom: 14 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "500",
              color: Colors.text1,
              marginBottom: 14,
            }}
          >
            By category
          </Text>

          {periodLoading ? (
            <ActivityIndicator
              color={Colors.accent}
              style={{ paddingVertical: 20 }}
            />
          ) : pieData.length > 0 ? (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 18 }}
            >
              <PieChart
                data={pieData}
                donut
                radius={62}
                innerRadius={42}
                innerCircleColor={Colors.bg}
                strokeColor={Colors.bg}
                strokeWidth={3}
                sectionAutoFocus
                centerLabelComponent={() => (
                  <View style={{ alignItems: "center" }}>
                    <Text style={{ fontSize: 9, color: Colors.text3 }}>
                      Total
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "500",
                        color: Colors.text1,
                      }}
                    >
                      $
                      {periodTotal.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </Text>
                  </View>
                )}
              />

              <View style={{ flex: 1, gap: 10 }}>
                {displayCategories.map((c) => {
                  const pct =
                    periodTotal > 0 ? (c.total / periodTotal) * 100 : 0;
                  return (
                    <View
                      key={c.name}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: getChartColor(c.name),
                        }}
                      />
                      <Text
                        style={{ fontSize: 12, color: Colors.text1, flex: 1 }}
                        numberOfLines={1}
                      >
                        {c.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "500",
                          color: Colors.text1,
                        }}
                      >
                        {pct.toFixed(0)}%
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : (
            <Text
              style={{
                fontSize: 12,
                color: Colors.text3,
                paddingVertical: 20,
                textAlign: "center",
              }}
            >
              No expenses in this period yet
            </Text>
          )}
        </View>

        {/* Daily spending card */}
        <View style={{ ...cardStyle, marginBottom: 14 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "500",
              color: Colors.text1,
              marginBottom: 14,
            }}
          >
            Daily spending — last 7 days
          </Text>

          {weekLoading ? (
            <ActivityIndicator
              color={Colors.accent}
              style={{ paddingVertical: 20 }}
            />
          ) : (
            <BarChart
              data={barData}
              barWidth={22}
              spacing={20}
              initialSpacing={10}
              endSpacing={10}
              barBorderRadius={6}
              hideRules
              xAxisThickness={0}
              yAxisThickness={0}
              yAxisTextStyle={{ color: Colors.text3, fontSize: 10 }}
              noOfSections={3}
              height={130}
              isAnimated
            />
          )}
        </View>

        {/* Month over month card */}
        {monthCards.length > 0 && (
          <View style={{ ...cardStyle, marginBottom: 14 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text
                style={{ fontSize: 13, fontWeight: "500", color: Colors.text1 }}
              >
                Month-over-month
              </Text>
              {momPct !== null && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 3,
                    backgroundColor:
                      momPct >= 0 ? Colors.redBg : Colors.greenBg,
                    borderRadius: 100,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                  }}
                >
                  <Ionicons
                    name={momPct >= 0 ? "trending-up" : "trending-down"}
                    size={12}
                    color={momPct >= 0 ? Colors.red : Colors.green}
                  />
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "500",
                      color: momPct >= 0 ? Colors.red : Colors.green,
                    }}
                  >
                    {Math.abs(momPct).toFixed(1)}%
                  </Text>
                </View>
              )}
            </View>

            <View style={{ flexDirection: "row", gap: 9 }}>
              {monthCards.map((m) => (
                <View
                  key={m.label}
                  style={{
                    flex: 1,
                    alignItems: "center",
                    backgroundColor: m.isCurrent ? Colors.accentBg : Colors.bg2,
                    borderRadius: 14,
                    paddingVertical: 12,
                    borderWidth: m.isCurrent ? 1.5 : 0,
                    borderColor: Colors.accent,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10.5,
                      color: m.isCurrent ? Colors.accent : Colors.text3,
                    }}
                  >
                    {m.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "500",
                      color: m.isCurrent ? Colors.accentDark : Colors.text2,
                      marginTop: 2,
                    }}
                  >
                    $
                    {m.total.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
