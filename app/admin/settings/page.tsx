import { createClient } from "@/lib/supabase/server";
import SettingsClient from "./SettingsClient";
import type { ShopSetting } from "@/lib/supabase/types";

export const metadata = {
  title: "Shop Settings | Zeviora Admin",
};

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const { data: rawSettings } = await supabase
    .from("shop_settings")
    .select("*");

  const settings = (rawSettings as ShopSetting[]) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-widest text-[var(--gold)]">
          Configuration
        </span>
        <h1
          className="text-2xl sm:text-3xl font-light mt-1"
          style={{ fontFamily: "var(--font-serif)", color: "var(--text-primary)" }}
        >
          Store Settings
        </h1>
      </div>

      <SettingsClient initialSettings={settings} />
    </div>
  );
}
