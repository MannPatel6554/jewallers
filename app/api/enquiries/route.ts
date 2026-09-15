import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface IncomingItem {
  product_id?: string | null;
  code?: string;
  name?: string;
  price?: number;
  quantity?: number;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const {
      items,
      estimated_total,
      whatsapp_message,
    } = body;

    // Validate estimated_total
    const numericTotal = Number(estimated_total);
    if (isNaN(numericTotal) || numericTotal < 0 || !isFinite(numericTotal) || numericTotal > 100_000_000) {
      return NextResponse.json(
        { error: "Invalid estimated total" },
        { status: 400 }
      );
    }

    // Validate whatsapp_message
    const sanitizedMessage = typeof whatsapp_message === "string" 
      ? whatsapp_message.slice(0, 5000) 
      : "";

    // Validate items array if provided
    const validatedItems: Array<{
      order_request_id?: string;
      product_id: string | null;
      product_code_snapshot: string;
      product_name_snapshot: string;
      price_snapshot: number;
      quantity: number;
    }> = [];

    if (items) {
      if (!Array.isArray(items) || items.length > 50) {
        return NextResponse.json(
          { error: "Items must be an array with at most 50 elements" },
          { status: 400 }
        );
      }

      for (const item of items as IncomingItem[]) {
        const qty = Number(item.quantity);
        const price = Number(item.price);

        if (!Number.isInteger(qty) || qty < 1 || qty > 999) {
          return NextResponse.json(
            { error: "Invalid item quantity (must be 1-999)" },
            { status: 400 }
          );
        }

        if (isNaN(price) || price < 0 || !isFinite(price) || price > 10_000_000) {
          return NextResponse.json(
            { error: "Invalid item price" },
            { status: 400 }
          );
        }

        const code = typeof item.code === "string" ? item.code.trim().slice(0, 100) : "UNKNOWN";
        const name = typeof item.name === "string" ? item.name.trim().slice(0, 200) : "Jewellery Piece";
        const productId = typeof item.product_id === "string" && item.product_id.length <= 100 
          ? item.product_id 
          : null;

        validatedItems.push({
          product_id: productId,
          product_code_snapshot: code,
          product_name_snapshot: name,
          price_snapshot: price,
          quantity: qty,
        });
      }
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 1. Insert order_request with forced server-controlled status
    const { data: orderRequest, error: orderError } = await supabase
      .from("order_requests")
      .insert({
        user_id: user?.id ?? null,
        status: "pending", // ALWAYS forced to pending server-side
        estimated_total: numericTotal,
        whatsapp_message: sanitizedMessage,
      })
      .select()
      .single();

    if (orderError || !orderRequest) {
      console.error("Order request insert error:", orderError);
      return NextResponse.json(
        { error: orderError?.message || "Failed to record enquiry" },
        { status: 500 }
      );
    }

    // 2. Insert order_request_items if items provided
    if (validatedItems.length > 0) {
      const itemRows = validatedItems.map((item) => ({
        ...item,
        order_request_id: orderRequest.id,
      }));

      const { error: itemsError } = await supabase
        .from("order_request_items")
        .insert(itemRows);

      if (itemsError) {
        console.error("Order request items insert error:", itemsError);
      }
    }

    return NextResponse.json({
      success: true,
      order_id: orderRequest.id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
