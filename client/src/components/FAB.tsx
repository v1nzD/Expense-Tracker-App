import { TouchableOpacity, Text } from "react-native";
import { Colors } from "../constants/theme";

type FABProps = {
  onPress: () => void;
};

export default function FAB({ onPress }: FABProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        position: "absolute",
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.accent,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: Colors.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <Text style={{ color: "white", fontSize: 28, lineHeight: 32 }}>+</Text>
    </TouchableOpacity>
  );
}
