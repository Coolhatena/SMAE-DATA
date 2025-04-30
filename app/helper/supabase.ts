import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const url = "https://tkvetehxdzehwhgyqmlp.supabase.co";
const key = "";

export const supabase = createClient(url, key, {
	auth: {
		storage: AsyncStorage,
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: true,
	},
});