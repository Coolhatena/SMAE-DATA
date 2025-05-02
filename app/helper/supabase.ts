import 'react-native-url-polyfill';
import * as SecureStore from "expo-secure-store";
import { createClient } from "@supabase/supabase-js";

const url = process.env.EXPO_PUBLIC_SUPABASE_URI;
const key = process.env.EXPO_PUBLIC_SUPABASE_API_KEY;

interface StorageAdapter { 
	getItem: (key: string) => Promise<string | null>;
	setItem: (key: string, value: string) => Promise<void>;
	removeItem: (key: string) => Promise<void>;
}

const ExpoSecureStoreAdapter: StorageAdapter = {
	getItem: (key: string) => {
		return SecureStore.getItemAsync(key);
	},
	setItem: (key: string, value: string) => {
		return SecureStore.setItemAsync(key, value);
	},
	removeItem: (key: string) => {
		return SecureStore.deleteItemAsync(key);
	}
}

export const supabase = createClient(url!, key!, {
	auth: {
		storage: ExpoSecureStoreAdapter,
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: true,
	},
});