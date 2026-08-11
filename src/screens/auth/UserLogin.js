import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, TouchableWithoutFeedback, Keyboard, } from "react-native";
import { loginUser } from "../../util/apicall";

const StudyPointLogin = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState({ username: false, password: false });

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      Alert.alert("Missing Details", "Please enter both username and password.");
      return;
    }

    try {
      setLoading(true);
      await loginUser(username.trim(), password);
    } catch (error) {
      Alert.alert("Login Failed", error.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.loginCard}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.appName}>STUDY POINT</Text>
            <Text style={styles.tagline}>Your Learning Companion</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <Text style={styles.loginTitle}>Sign In</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={[
                  styles.input,
                  isFocused.username && styles.inputFocused,
                ]}
                placeholder="Enter your username"
                placeholderTextColor="#94a3b8"
                value={username}
                onChangeText={setUsername}
                onFocus={() => setIsFocused((p) => ({ ...p, username: true }))}
                onBlur={() => setIsFocused((p) => ({ ...p, username: false }))}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    isFocused.password && styles.inputFocused,
                  ]}
                  placeholder="Enter your password"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setIsFocused((p) => ({ ...p, password: true }))}
                  onBlur={() => setIsFocused((p) => ({ ...p, password: false }))}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeText}>
                    {showPassword ? "Hide" : "Show"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={() => Alert.alert("Reset Password", "Redirecting to password reset...")}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Don't have an account?{" "}
              <Text style={styles.signUpText} onPress={() => Alert.alert("Sign Up", "Navigate to registration page")}>
                Sign Up
              </Text>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default StudyPointLogin;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#afd7ffff", justifyContent: "center", padding: 24, },
  loginCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 24, shadowColor: "#0f172a", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4, },
  header: { alignItems: "center", marginBottom: 28, },
  appName: { fontSize: 24, fontFamily: "Poppins-SemiBold", color: "#0f172a", letterSpacing: 1, },
  tagline: { fontSize: 13, color: "#64748b", marginTop: 4, fontFamily: "Poppins-Medium", }, 
  formContainer: { marginBottom: 16, },
  loginTitle: { fontSize: 18, fontFamily: "Poppins-SemiBold", color: "#1e293b", marginBottom: 20, textAlign: "center", },
  inputContainer: { marginBottom: 16, },
  inputLabel: { fontSize: 13, fontFamily: "Poppins-SemiBold", color: "#334155", marginBottom: 6, },
  passwordWrapper: { position: "relative", },
  input: { height: 48, borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 10, paddingHorizontal: 14, fontSize: 14, fontFamily: "Poppins-Regular", color: "#0f172a", backgroundColor: "#f8fafc", },
  passwordInput: { paddingRight: 60, },
  inputFocused: { borderColor: "#2563eb", backgroundColor: "#ffffff", },
  eyeBtn: { position: "absolute", right: 14, top: 14, },
  eyeText: { fontSize: 12, fontFamily: "Poppins-SemiBold", color: "#2563eb", },
  loginButton: { backgroundColor: "#2563eb", height: 48, borderRadius: 10, justifyContent: "center", alignItems: "center", marginTop: 12, },
  loginButtonDisabled: { backgroundColor: "#94a3b8", },
  loginButtonText: { color: "#ffffff", fontSize: 15, fontFamily: "Poppins-SemiBold", },
  forgotPasswordContainer: { alignItems: "flex-end", marginBottom: 16, },
  forgotPasswordText: { fontSize: 12, color: "#2563eb", fontFamily: "Poppins-SemiBold", },
  footer: { alignItems: "center", paddingTop: 16, borderTopWidth: 1, borderTopColor: "#f1f5f9", },
  footerText: { fontSize: 13, color: "#64748b", fontFamily: "Poppins-Regular", },
  signUpText: { color: "#2563eb", fontFamily: "Poppins-SemiBold", },
});