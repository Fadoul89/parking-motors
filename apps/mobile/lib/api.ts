import * as SecureStore from "expo-secure-store";
import { createApiClient } from "@parking-motors/shared";
import { API_BASE_URL } from "./config";

const TOKEN_KEY = "pm_token";

export async function getStoredToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setStoredToken(token: string | null) {
  if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
  else await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export const api = createApiClient({
  baseUrl: API_BASE_URL,
  getToken: getStoredToken,
});
