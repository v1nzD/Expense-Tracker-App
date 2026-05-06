import { NavigationContainer } from "@react-navigation/native";
import { useAuthStore } from "../store/authStore";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import LoginScreen from "../screens/auth/LoginScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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
const AppNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={() => null} />
      <Tab.Screen name="Expense" component={() => null} />
      <Tab.Screen name="Analytics" component={() => null} />
    </Tab.Navigator>
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
