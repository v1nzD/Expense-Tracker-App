import { NavigationContainer } from "@react-navigation/native";
import { useAuthStore } from "../store/authStore";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import LoginScreen from "../screens/auth/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import ExpensesScreen from "../screens/ExpensesScreen";
import AddExpenseScreen from "../screens/AddExpenseScreen";
import { RootStackParamList } from "../types/navigation";
import AnalyticsScreen from "../screens/AnalyticsScreen";

// export type AppStackParamList = {
//   Tabs: undefined;
//   AddExpense: undefined;
// };

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const AppStack = createNativeStackNavigator<RootStackParamList>();

const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Register" component={() => null} />
    </Stack.Navigator>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Expenses" component={ExpensesScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
    </Tab.Navigator>
  );
};
const AppNavigator = () => {
  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      <AppStack.Screen name="Tabs" component={TabNavigator} />
      <AppStack.Screen
        name="AddExpense"
        component={AddExpenseScreen}
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
    </AppStack.Navigator>
  );
};

export default function RootNavigator() {
  const token = useAuthStore((state) => state.token);

  return (
    <NavigationContainer>
      {token ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
