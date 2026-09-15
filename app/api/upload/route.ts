import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "avif", "gif"]);
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

async function getAuthenticatedAdminClient(request: NextRequest) {
  const cookieClient = await createClient();

  // Try Bearer token if provided in Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    if (token) {
      const { data: userData, error: userErr } = await cookieClient.auth.getUser(token);
      if (userData?.user && !userErr) {
        const authedClient = createSupabaseClient<Database>(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            global: {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          }
        );

        const { data: profile } = await authedClient
          .from("profiles")
          .select("role")
          .eq("id", userData.user.id)
          .single();

        return {
          user: userData.user,
          isAdmin: profile?.role === "admin",
          client: authedClient,
        };
      }
    }
  }

  // Fallback to cookie-based session
  const { data: cookieUserData } = await cookieClient.auth.getUser();
  if (cookieUserData?.user) {
    const { data: profile } = await cookieClient
      .from("profiles")
      .select("role")
      .eq("id", cookieUserData.user.id)
      .single();

    return {
      user: cookieUserData.user,
      isAdmin: profile?.role === "admin",
      client: cookieClient,
    };
  }

  return { user: null, isAdmin: false, client: cookieClient };
}

export async function POST(request: NextRequest) {
  try {
    const { user, isAdmin, client } = await getAuthenticatedAdminClient(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Only administrators can upload product images." },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate size (up to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds 10MB limit" }, { status: 400 });
    }

    // Validate extension
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: `Unsupported file extension. Allowed: ${Array.from(ALLOWED_EXTENSIONS).join(", ")}` },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}. Must be a valid image.` },
        { status: 400 }
      );
    }

    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
    const filePath = `products/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await client.storage
      .from("product-images")
      .upload(filePath, buffer, {
        contentType: file.type || "image/jpeg",
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      path: data.path,
      fullPath: data.fullPath,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, isAdmin, client } = await getAuthenticatedAdminClient(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Only administrators can delete product images." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { paths } = body as { paths: string[] };

    if (!paths || !Array.isArray(paths) || paths.length === 0) {
      return NextResponse.json({ error: "No paths provided" }, { status: 400 });
    }

    // Validate path hygiene (no directory traversal, must be within products/)
    const sanitizedPaths: string[] = [];
    for (const p of paths) {
      if (typeof p !== "string" || p.includes("..") || !p.startsWith("products/")) {
        return NextResponse.json(
          { error: "Invalid file path specified for deletion" },
          { status: 400 }
        );
      }
      sanitizedPaths.push(p);
    }

    const { data, error } = await client.storage
      .from("product-images")
      .remove(sanitizedPaths);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, removed: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
