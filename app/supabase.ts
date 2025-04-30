import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const url = "https://tkvetehxdzehwhgyqmlp.supabase.co/rest/v1/smae";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrdmV0ZWh4ZHplaHdoZ3lxbWxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5NjU3MTIsImV4cCI6MjA2MTU0MTcxMn0.lEKE7KsqKlKhJGe3IkyIQgJekwydAvA33ixQZG3zqlU";

export const supabase = createClient(url, key, {
	auth: {
		storage: AsyncStorage,
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: true,
	},
});