import { useState } from "react";
import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../api/auth";
import { useAuthStore } from "../store/authStore";

type LoginFormProps = {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
};

export default function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
}: LoginFormProps) {
  const setAuth = useAuthStore((state) => state.setAuth);

  const { mutate, isPending } = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      setAuth(data.user, data.token);
    },
    onError: (error: any) => {
      Alert.alert(
        "Login failed",
        error?.response?.data?.error || "Something went wrong",
      );
    },
  });

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    mutate({ email, password });
  };
  return (
    <View className="flex-1 justify-between">
      {/* Form */}
      <View className="gap-[14px]">
        <TextInput
          placeholder="alex@email.com"
          placeholderTextColor="#9298A8"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          className="bg-bg2 border border-black/10 rounded-[11px] px-[14px] py-[16px] text-[13px] text-text1"
        />

        <TextInput
          placeholder="••••••••"
          placeholderTextColor="#9298A8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="bg-bg2 border border-black/10 rounded-[11px] px-[14px] py-[16px] text-[13px] text-text1"
        />
      </View>

      {/* Forgot password */}
      <View className="items-end mt-6 mb-6">
        <Text className="text-[12px] text-accent font-bold">
          Forgot password?
        </Text>
      </View>

      {/* Sign in button */}
      <TouchableOpacity
        className="bg-accent rounded-full py-[16px] items-center"
        onPress={handleLogin}
        disabled={isPending}
      >
        <Text className="text-white text-[14px] font-medium">Sign in</Text>
      </TouchableOpacity>

      {/* Divider */}
      <View className="flex-row items-center gap-[10px] mt-[18px] mb-[18px]">
        <View className="flex-1 h-[0.5px] bg-black/10" />
        <Text className="text-[11px] text-text3">or continue with</Text>
        <View className="flex-1 h-[0.5px] bg-black/10" />
      </View>

      {/* Social buttons */}
      <View className="flex-row gap-[9px]">
        {/* Google */}
        <TouchableOpacity className="flex-1 bg-bg2 border border-black/10 rounded-full py-[10px] items-center justify-center flex-row gap-[6px]">
          <Image
            source={require("../../assets/google-logo.svg")}
            className="w-8 h-8"
          />
          <Text className="text-[12px] text-text1">Google</Text>
        </TouchableOpacity>

        {/* Apple */}
        <TouchableOpacity className="flex-1 bg-bg2 border border-black/10 rounded-full py-[10px] items-center justify-center flex-row gap-[6px]">
          <Image
            source={require("../../assets/apple-logo.png")}
            className="w-8 h-8"
          />
          <Text className="text-[12px] text-text1">Apple</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View className="items-center mt-auto mb-[10px]">
        <Text className="text-[12px] text-text3">
          New here?{" "}
          <Text className="text-accent font-medium">Create account</Text>
        </Text>
      </View>
    </View>
  );
}
