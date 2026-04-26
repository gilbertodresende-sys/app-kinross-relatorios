import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { INITIAL_USERS } from "../src/data/initialUsers";

const USERS_STORAGE_KEY = "@kinross_app_users";
const CURRENT_USER_STORAGE_KEY = "@kinross_app_current_user";

const AuthContext = createContext(null);

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function buildId(name, email) {
  const base = name || email || String(Date.now());
  return normalize(base)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    loadAuth();
  }, []);

  async function loadAuth() {
    try {
      const storedUsers = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      let parsedUsers = storedUsers ? JSON.parse(storedUsers) : null;

      if (!Array.isArray(parsedUsers) || parsedUsers.length === 0) {
        parsedUsers = INITIAL_USERS;
        await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(parsedUsers));
      } else {
        const merged = [...parsedUsers];

        INITIAL_USERS.forEach((initialUser) => {
          const exists = merged.some(
            (user) => normalize(user.email) === normalize(initialUser.email)
          );

          if (!exists) {
            merged.push(initialUser);
          }
        });

        parsedUsers = merged;
        await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(parsedUsers));
      }

      setUsers(parsedUsers);

      const storedCurrentUser = await AsyncStorage.getItem(CURRENT_USER_STORAGE_KEY);

      if (storedCurrentUser) {
        const parsedCurrent = JSON.parse(storedCurrentUser);
        const freshUser = parsedUsers.find((user) => user.id === parsedCurrent.id);

        if (freshUser) {
          setCurrentUser(freshUser);
        }
      }
    } catch (error) {
      console.log("Erro ao carregar usuários:", error);
      setUsers(INITIAL_USERS);
    } finally {
      setLoadingAuth(false);
    }
  }

  async function persistUsers(nextUsers) {
    setUsers(nextUsers);
    await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(nextUsers));
  }

  async function login(identifier, password) {
    const loginValue = normalize(identifier);
    const passwordValue = String(password || "");

    const foundUser = users.find((user) => {
      return (
        normalize(user.email) === loginValue ||
        normalize(user.name) === loginValue ||
        normalize(user.id) === loginValue
      );
    });

    if (!foundUser || String(foundUser.password) !== passwordValue) {
      throw new Error("Usuário ou senha inválidos.");
    }

    setCurrentUser(foundUser);
    await AsyncStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(foundUser));

    return foundUser;
  }

  async function logout() {
    setCurrentUser(null);
    await AsyncStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  }

  async function changePassword(oldPassword, newPassword, confirmPassword) {
    if (!currentUser) {
      throw new Error("Nenhum usuário logado.");
    }

    if (String(oldPassword || "") !== String(currentUser.password)) {
      throw new Error("Senha atual incorreta.");
    }

    if (!newPassword || String(newPassword).length < 6) {
      throw new Error("A nova senha deve ter no mínimo 6 caracteres.");
    }

    if (newPassword !== confirmPassword) {
      throw new Error("A confirmação da senha não confere.");
    }

    const nextUsers = users.map((user) => {
      if (user.id === currentUser.id) {
        return {
          ...user,
          password: newPassword,
          mustChangePassword: false,
        };
      }

      return user;
    });

    await persistUsers(nextUsers);

    const updatedCurrentUser = nextUsers.find((user) => user.id === currentUser.id);

    setCurrentUser(updatedCurrentUser);
    await AsyncStorage.setItem(
      CURRENT_USER_STORAGE_KEY,
      JSON.stringify(updatedCurrentUser)
    );
  }

  async function addUser({ name, email, password }) {
    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Somente o Admin pode inserir novos usuários.");
    }

    const cleanName = String(name || "").trim();
    const cleanEmail = String(email || "").trim();
    const cleanPassword = String(password || "").trim();

    if (!cleanName || !cleanEmail || !cleanPassword) {
      throw new Error("Preencha nome, e-mail e senha.");
    }

    const exists = users.some((user) => normalize(user.email) === normalize(cleanEmail));

    if (exists) {
      throw new Error("Já existe um usuário cadastrado com esse e-mail.");
    }

    const newUser = {
      id: buildId(cleanName, cleanEmail),
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      role: "user",
      mustChangePassword: cleanPassword === "123456",
      createdAt: new Date().toISOString(),
    };

    const nextUsers = [...users, newUser];
    await persistUsers(nextUsers);

    return newUser;
  }

  const value = useMemo(
    () => ({
      users,
      currentUser,
      loadingAuth,
      isLoggedIn: Boolean(currentUser),
      isAdmin: currentUser?.role === "admin",
      login,
      logout,
      changePassword,
      addUser,
      reloadUsers: loadAuth,
    }),
    [users, currentUser, loadingAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }

  return context;
}