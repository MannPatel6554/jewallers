import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AccountClient from "./AccountClient";
import type { Profile, OrderRequest, OrderRequestItem } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "My Account",
  description: "Manage your Zeviora account profile and view your WhatsApp enquiry history.",
};

type EnrichedOrderRequest = OrderRequest & {
  order_request_items: OrderRequestItem[];
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/account");
  }

  // Fetch Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch Order Requests
  const { data: rawRequests } = await supabase
    .from("order_requests")
    .select("*, order_request_items(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const orderRequests = (rawRequests as EnrichedOrderRequest[]) ?? [];

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <span
          className="text-xs uppercase tracking-widest"
          style={{ color: "var(--gold)" }}
        >
          Customer Portal
        </span>
        <h1
          className="text-2xl sm:text-3xl font-light mt-1"
          style={{
            fontFamily: "var(--font-serif)",
            color: "var(--text-primary)",
          }}
        >
          My Account
        </h1>
      </div>

      <AccountClient
        user={{ id: user.id, email: user.email }}
        profile={profile as Profile | null}
        orderRequests={orderRequests}
      />
    </main>
  );
}
