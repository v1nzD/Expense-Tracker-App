import { useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LoginForm from "../../components/LoginForm";
import SignUpForm from "../../components/SignupForm";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [activeTab, setActiveTab] = useState("login");

  return (
    <SafeAreaView className="flex-1 bg-white px-8">
      <View className="flex-1 pt-[30px]">
        {/* Header */}
        <View className="items-center mb-7">
          {/* Logo */}
          <View className="w-40 h-40 items-center justify-center">
            <Image
              source={require("../../../assets/Spendr_logo.png")}
              className="w-full h-full"
              resizeMode="contain"
            />
          </View>

          <Text className="text-[22px] font-medium text-text1 mb-2">
            Welcome back
          </Text>
          <Text className="text-[13px] text-text3">
            Sign in to your Spendr account
          </Text>
        </View>

        {/* Tab */}
        <View className="flex-row bg-bg2 rounded-[12px] p-[6px] gap-[2px] mb-6">
          {/* Login Tab */}
          <TouchableOpacity
            onPress={() => setActiveTab("login")}
            className={`flex-1 py-[12px] rounded-[8px] items-center ${
              activeTab === "login" ? "bg-white border border-black/10" : ""
            }`}
          >
            <Text
              className={`text-[12px] font-semibold ${
                activeTab === "login" ? "text-accent font-bold" : "text-text2"
              }`}
            >
              Login
            </Text>
          </TouchableOpacity>

          {/* Sign Up Tab */}
          <TouchableOpacity
            onPress={() => setActiveTab("signup")}
            className={`flex-1 py-[12px] rounded-[8px] items-center ${
              activeTab === "signup" ? "bg-white border border-black/10" : ""
            }`}
          >
            <Text
              className={`text-[12px] font-semibold ${
                activeTab === "signup" ? "text-accent font-bold" : "text-text2"
              }`}
            >
              Sign up
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "login" ? (
          <LoginForm
            email={email}
            password={password}
            setEmail={setEmail}
            setPassword={setPassword}
          />
        ) : (
          <SignUpForm
            first_name={first_name}
            setFirstName={setFirstName}
            last_name={last_name}
            setLastName={setLastName}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
