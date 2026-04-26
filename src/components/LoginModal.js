import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";

export default function LoginModal({ visible }) {
  const { login, loadingAuth, currentUser } = useAuth();

  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);

  useEffect(() => {
    if (!visible) {
      setSenha("");
    }
  }, [visible]);

  async function handleLogin() {
    try {
      setLoadingLogin(true);
      await login(usuario, senha);
      setUsuario("");
      setSenha("");
    } catch (error) {
      Alert.alert("Login não realizado", error.message);
    } finally {
      setLoadingLogin(false);
    }
  }

  return (
    <Modal
      visible={visible && !currentUser}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>Acesse para continuar usando o app.</Text>

          <Text style={styles.label}>Usuário ou e-mail</Text>
          <TextInput
            value={usuario}
            onChangeText={setUsuario}
            placeholder="Digite seu nome ou e-mail"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            value={senha}
            onChangeText={setSenha}
            placeholder="Digite sua senha"
            secureTextEntry
            style={styles.input}
          />

          <Text style={styles.helpText}>
            Contate o administrador em caso de perda de senha.
          </Text>

          <Pressable
            style={[styles.button, (loadingAuth || loadingLogin) && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loadingAuth || loadingLogin}
          >
            {loadingLogin || loadingAuth ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 22,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 14,
    backgroundColor: "#f9fafb",
  },
  helpText: {
    color: "#6b7280",
    fontSize: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#C4912F",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});