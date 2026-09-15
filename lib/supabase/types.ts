export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          phone: string | null;
          role: "customer" | "admin";
          created_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          phone?: string | null;
          role?: "customer" | "admin";
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          phone?: string | null;
          role?: "customer" | "admin";
          created_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          code: string;
          name: string;
          description: string | null;
          price: number;
          category_id: string | null;
          availability: "available" | "sold_out";
          is_featured: boolean;
          is_new_arrival: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          description?: string | null;
          price: number;
          category_id?: string | null;
          availability?: "available" | "sold_out";
          is_featured?: boolean;
          is_new_arrival?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          description?: string | null;
          price?: number;
          category_id?: string | null;
          availability?: "available" | "sold_out";
          is_featured?: boolean;
          is_new_arrival?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          storage_path: string;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          storage_path: string;
          position?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          storage_path?: string;
          position?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      wishlist: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wishlist_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      order_requests: {
        Row: {
          id: string;
          user_id: string | null;
          status: "pending" | "contacted" | "confirmed" | "completed" | "cancelled";
          estimated_total: number;
          whatsapp_message: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          status?: "pending" | "contacted" | "confirmed" | "completed" | "cancelled";
          estimated_total: number;
          whatsapp_message: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          status?: "pending" | "contacted" | "confirmed" | "completed" | "cancelled";
          estimated_total?: number;
          whatsapp_message?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_requests_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      order_request_items: {
        Row: {
          id: string;
          order_request_id: string;
          product_id: string | null;
          product_code_snapshot: string;
          product_name_snapshot: string;
          price_snapshot: number;
          quantity: number;
        };
        Insert: {
          id?: string;
          order_request_id: string;
          product_id?: string | null;
          product_code_snapshot: string;
          product_name_snapshot: string;
          price_snapshot: number;
          quantity: number;
        };
        Update: {
          id?: string;
          order_request_id?: string;
          product_id?: string | null;
          product_code_snapshot?: string;
          product_name_snapshot?: string;
          price_snapshot?: number;
          quantity?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_request_items_order_request_id_fkey";
            columns: ["order_request_id"];
            isOneToOne: false;
            referencedRelation: "order_requests";
            referencedColumns: ["id"];
          }
        ];
      };
      shop_settings: {
        Row: {
          id: string;
          key: string;
          value: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
  };
}

// Convenience types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductImage = Database["public"]["Tables"]["product_images"]["Row"];
export type WishlistItem = Database["public"]["Tables"]["wishlist"]["Row"];
export type CartItem = Database["public"]["Tables"]["cart_items"]["Row"];
export type OrderRequest = Database["public"]["Tables"]["order_requests"]["Row"];
export type OrderRequestItem = Database["public"]["Tables"]["order_request_items"]["Row"];
export type ShopSetting = Database["public"]["Tables"]["shop_settings"]["Row"];

// Enriched types used across components
export type ProductWithImages = Product & {
  product_images: ProductImage[];
  categories?: Category | null;
};

export type CartItemWithProduct = CartItem & {
  products: ProductWithImages | null;
};

export type WishlistItemWithProduct = WishlistItem & {
  products: ProductWithImages | null;
};
