import React, { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Constants from "expo-constants";
import { useAuth } from "../context/AuthContext";

function getManifestInfo() {
  const config =
    Constants.expoConfig ||
    Constants.manifest2?.extra?.expoClient ||
    Constants.manifest ||
    {};

  return {
    name: config.name || "App Kinross",
    slug: config.slug || "-",
    version: config.version || "-",
    sdkVersion: config.sdkVersion || Constants.expoConfig?.sdkVersion || "-",
    runtimeVersion: config.runtimeVersion || "-",
    developer: "Gilberto Resende",
  };
}

export default function UserMenu() {
  const { currentUser, isAdmin, logout, changePassword, addUser } = useAuth();

  const [menuVisible, setMenuVisible] = useState(false);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [addUserVisible, setAddUserVisible] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("123456");

  const manifest = getManifestInfo();

  async function handleLogout() {
    setMenuVisible(false);
    await logout();
  }

  async function handleChangePassword() {
    try {
      await changePassword(senhaAtual, novaSenha, confirmarSenha);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
      setChangePasswordVisible(false);
      Alert.alert("Senha alterada", "Sua senha foi alterada com sucesso.");
    } catch (error) {
      Alert.alert("Não foi possível alterar a senha", error.message);
    }
  }

  async function handleAddUser() {
    try {
      await addUser({
        name: newName,
        email: newEmail,
        password: newPassword,
      });

      setNewName("");
      setNewEmail("");
      setNewPassword("123456");
      setAddUserVisible(false);

      Alert.alert("Usuário criado", "O novo usuário foi cadastrado com sucesso.");
    } catch (error) {
      Alert.alert("Não foi possível criar o usuário", error.message);
    }
  }

  if (!currentUser) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.avatarButton} onPress={() => setMenuVisible(true)}>
        <Text style={styles.avatarText}>☰</Text>
      </Pressable>

      <Modal visible={menuVisible} transparent animationType="fade">
        <Pressable style={styles.backdrop} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuCard}>
            <Text style={styles.userName}>{currentUser.name}</Text>
            <Text style={styles.userEmail}>{currentUser.email}</Text>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                setChangePasswordVisible(true);
              }}
            >
              <Text style={styles.menuItemText}>Trocar senha</Text>
            </Pressable>

            {isAdmin && (
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  setAddUserVisible(true);
                }}
              >
                <Text style={styles.menuItemText}>Inserir novo usuário</Text>
              </Pressable>
            )}

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                setAboutVisible(true);
              }}
            >
              <Text style={styles.menuItemText}>Sobre o app</Text>
            </Pressable>

            <Pressable style={styles.logoutItem} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={changePasswordVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.formCard}>
            <Text style={styles.modalTitle}>Trocar senha</Text>

            <TextInput
              style={styles.input}
              placeholder="Senha atual"
              secureTextEntry
              value={senhaAtual}
              onChangeText={setSenhaAtual}
            />

            <TextInput
              style={styles.input}
              placeholder="Nova senha"
              secureTextEntry
              value={novaSenha}
              onChangeText={setNovaSenha}
            />

            <TextInput
              style={styles.input}
              placeholder="Confirmar nova senha"
              secureTextEntry
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
            />

            <View style={styles.rowButtons}>
              <Pressable
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => setChangePasswordVisible(false)}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>

              <Pressable style={styles.actionButton} onPress={handleChangePassword}>
                <Text style={styles.actionText}>Salvar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={addUserVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.formCard}>
            <Text style={styles.modalTitle}>Inserir novo usuário</Text>

            <TextInput
              style={styles.input}
              placeholder="Nome"
              value={newName}
              onChangeText={setNewName}
            />

            <TextInput
              style={styles.input}
              placeholder="E-mail"
              autoCapitalize="none"
              keyboardType="email-address"
              value={newEmail}
              onChangeText={setNewEmail}
            />

            <TextInput
              style={styles.input}
              placeholder="Senha temporária"
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <View style={styles.rowButtons}>
              <Pressable
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => setAddUserVisible(false)}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>

              <Pressable style={styles.actionButton} onPress={handleAddUser}>
                <Text style={styles.actionText}>Criar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={aboutVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.aboutCard}>
            <Text style={styles.modalTitle}>Sobre o app</Text>

            <ScrollView>
              <Text style={styles.aboutLine}>Nome: {manifest.name}</Text>
              <Text style={styles.aboutLine}>Slug: {manifest.slug}</Text>
              <Text style={styles.aboutLine}>Versão: {manifest.version}</Text>
              <Text style={styles.aboutLine}>SDK: {manifest.sdkVersion}</Text>
              <Text style={styles.aboutLine}>
                Runtime Version: {manifest.runtimeVersion}
              </Text>
              <Text style={styles.aboutLine}>Developer: {manifest.developer}</Text>
            </ScrollView>

            <Pressable
              style={[styles.actionButton, { marginTop: 16 }]}
              onPress={() => setAboutVisible(false)}
            >
              <Text style={styles.actionText}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 44,
    right: 16,
    zIndex: 999,
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#C4912F",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  avatarText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    alignItems: "flex-end",
    paddingTop: 92,
    paddingRight: 16,
  },
  menuCard: {
    width: 260,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    elevation: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  userEmail: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 12,
  },
  menuItem: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  menuItemText: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "600",
  },
  logoutItem: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  logoutText: {
    fontSize: 15,
    color: "#dc2626",
    fontWeight: "800",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    padding: 20,
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
  },
  aboutCard: {
    maxHeight: "75%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 12,
    backgroundColor: "#f9fafb",
  },
  rowButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#C4912F",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
  },
  actionText: {
    color: "#fff",
    fontWeight: "800",
  },
  cancelText: {
    color: "#374151",
    fontWeight: "800",
  },
  aboutLine: {
    fontSize: 15,
    color: "#374151",
    marginBottom: 8,
  },
});