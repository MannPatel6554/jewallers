"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ShopSetting } from "@/lib/supabase/types";

interface SettingsClientProps {
  initialSettings: ShopSetting[];
}

export default function SettingsClient({
  initialSettings,
}: SettingsClientProps) {
  const getVal = (key: string, def = "") =>
    initialSettings.find((s) => s.key === key)?.value ?? def;

  const [whatsapp, setWhatsapp] = useState(getVal("whatsapp_number", "918156081933"));
  const [mapsUrl, setMapsUrl] = useState(
    getVal("maps_url", "https://maps.app.goo.gl/TiyjdofYPWRfvCG57?g_st=ac")
  );
  const [storeAddress, setStoreAddress] = useState(
    getVal("store_address", "Visit our flagship showroom for offline purchases.")
  );
  const [storePhone, setStorePhone] = useState(getVal("store_phone", "+91 8156081933"));
  const [contactEmail, setContactEmail] = useState(getVal("contact_email", "contact@zeviora.in"));

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const supabase = createClient();
    const settingsToUpsert = [
      { key: "whatsapp_number", value: whatsapp.trim() },
      { key: "maps_url", value: mapsUrl.trim() },
      { key: "store_address", value: storeAddress.trim() },
      { key: "store_phone", value: storePhone.trim() },
      { key: "contact_email", value: contactEmail.trim() },
    ];

    const { error } = await supabase
      .from("shop_settings")
      .upsert(settingsToUpsert, { onConflict: "key" });

    setSaving(false);
    if (error) {
      setMessage({ text: error.message, type: "error" });
    } else {
      setMessage({ text: "Shop settings updated successfully.", type: "success" });
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <form
        onSubmit={handleSave}
        className="p-4 sm:p-6 rounded-xl space-y-6"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <h2
          className="text-lg font-medium border-b border-[var(--border-subtle)] pb-3"
          style={{ color: "var(--text-primary)" }}
        >
          Store & Contact Configuration
        </h2>

        {message && (
          <p
            className="text-xs p-3 rounded"
            style={{
              background:
                message.type === "success"
                  ? "rgba(34, 197, 94, 0.1)"
                  : "rgba(239, 68, 68, 0.1)",
              border:
                message.type === "success"
                  ? "1px solid rgba(34, 197, 94, 0.3)"
                  : "1px solid rgba(239, 68, 68, 0.3)",
              color:
                message.type === "success"
                  ? "var(--success)"
                  : "var(--error)",
            }}
          >
            {message.text}
          </p>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="setting-whatsapp" className="label text-xs">
              WhatsApp Enquiry Number (with country code, no + or spaces)
            </label>
            <input
              id="setting-whatsapp"
              type="text"
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="input-field font-mono"
              placeholder="918156081933"
            />
            <p className="text-[11px] text-[var(--text-muted)] mt-1">
              Used when customers click &ldquo;Send Order on WhatsApp&rdquo; or enquire about products.
            </p>
          </div>

          <div>
            <label htmlFor="setting-maps" className="label text-xs">
              Google Maps Location Link
            </label>
            <input
              id="setting-maps"
              type="url"
              required
              value={mapsUrl}
              onChange={(e) => setMapsUrl(e.target.value)}
              className="input-field"
              placeholder="https://maps.app.goo.gl/..."
            />
          </div>

          <div>
            <label htmlFor="setting-phone" className="label text-xs">
              Display Phone Number
            </label>
            <input
              id="setting-phone"
              type="text"
              value={storePhone}
              onChange={(e) => setStorePhone(e.target.value)}
              className="input-field"
              placeholder="+91 8156081933"
            />
          </div>

          <div>
            <label htmlFor="setting-email" className="label text-xs">
              Contact Email
            </label>
            <input
              id="setting-email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="input-field"
              placeholder="contact@zeviora.in"
            />
          </div>

          <div>
            <label htmlFor="setting-addr" className="label text-xs">
              Showroom Location / Note
            </label>
            <textarea
              id="setting-addr"
              rows={3}
              value={storeAddress}
              onChange={(e) => setStoreAddress(e.target.value)}
              className="input-field resize-y"
              placeholder="Showroom location info..."
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--border-subtle)] flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary text-xs px-6 py-2.5"
          >
            {saving ? "Saving Settings..." : "Save Configuration"}
          </button>
        </div>
      </form>
    </div>
  );
}
