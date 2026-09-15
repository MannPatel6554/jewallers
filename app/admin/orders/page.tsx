import { createClient } from "@/lib/supabase/server";
import OrdersClient from "./OrdersClient";
import type { OrderRequest, OrderRequestItem, Profile } from "@/lib/supabase/types";

export const metadata = {
  title: "WhatsApp Enquiries | Zeviora Admin",
};

type EnrichedOrder = OrderRequest & {
  order_request_items: OrderRequestItem[];
  profiles?: Profile | null;
};

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const { data: rawOrders } = await supabase
    .from("order_requests")
    .select("*, order_request_items(*)")
    .order("created_at", { ascending: false });

  const rawList = rawOrders ?? [];

  // Fetch profiles safely
  const userIds = [
    ...new Set(rawList.map((o) => o.user_id).filter((id): id is string => Boolean(id))),
  ];

  let profilesMap: Record<string, Profile> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("id", userIds);

    if (profiles) {
      profilesMap = Object.fromEntries(profiles.map((p) => [p.id, p as Profile]));
    }
  }

  const orders: EnrichedOrder[] = rawList.map((o) => ({
    ...o,
    profiles: o.user_id ? profilesMap[o.user_id] ?? null : null,
  })) as EnrichedOrder[];

  return <OrdersClient initialOrders={orders} />;
}
