import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { registerUser } from "../api/auth";
import { useAuthStore } from "../store/authStore";

type SignUpFormProps = {
  first_name: string;
  setFirstName: (val: string) => void;
  last_name: string;
  setLastName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
};
export default function SignUpForm({
  first_name,
  setFirstName,
  last_name,
  setLastName,
  email,
  setEmail,
  password,
  setPassword,
}: SignUpFormProps) {
  const setAuth = useAuthStore((state) => state.setAuth);

  const { mutate, isPending } = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      setAuth(data.user, data.token);
    },
    onError: (error: any) => {
      Alert.alert(
        "Error",
        error?.response?.data?.error || "Something went wrong",
      );
    },
  });

  const handleSignUp = () => {
    if (!first_name || !last_name || !email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    mutate({ first_name, last_name, email, password });
  };
  return (
    <View>
      <View className="gap-[12px]">
        <TextInput
          placeholder="First name"
          placeholderTextColor="#9298A8"
          value={first_name}
          onChangeText={setFirstName}
          className="bg-bg2 border border-black/10 rounded-[11px] px-[14px] py-[16px] text-[13px] text-text1"
        />

        <TextInput
          placeholder="Last name"
          placeholderTextColor="#9298A8"
          value={last_name}
          onChangeText={setLastName}
          className="bg-bg2 border border-black/10 rounded-[11px] px-[14px] py-[16px] text-[13px] text-text1"
        />

        <TextInput
          placeholder="Email"
          placeholderTextColor="#9298A8"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          className="bg-bg2 border border-black/10 rounded-[11px] px-[14px] py-[16px] text-[13px] text-text1"
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#9298A8"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          className="bg-bg2 border border-black/10 rounded-[11px] px-[14px] py-[16px] text-[13px] text-text1"
        />
      </View>

      <TouchableOpacity
        className="bg-accent rounded-full py-[16px] items-center mt-[18px]"
        onPress={handleSignUp}
        disabled={isPending}
      >
        <Text className="text-white text-[14px] font-medium">
          Create account
        </Text>
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
    </View>
  );
}
