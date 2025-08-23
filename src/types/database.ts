export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          status: "pending" | "paid" | "cancelled" | "delivered";
          total_amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: "pending" | "paid" | "cancelled" | "delivered";
          total_amount: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          status?: "pending" | "paid" | "cancelled" | "delivered";
          total_amount?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      address: {
        Row: {
          city: string | null;
          country: string | null;
          created_at: string;
          id: number;
          is_primary: boolean | null;
          state: string | null;
          street: string | null;
          user_id: string | null;
          zip: string | null;
        };
        Insert: {
          city?: string | null;
          country?: string | null;
          created_at?: string;
          id?: number;
          is_primary?: boolean | null;
          state?: string | null;
          street?: string | null;
          user_id?: string | null;
          zip?: string | null;
        };
        Update: {
          city?: string | null;
          country?: string | null;
          created_at?: string;
          id?: number;
          is_primary?: boolean | null;
          state?: string | null;
          street?: string | null;
          user_id?: string | null;
          zip?: string | null;
        };
      };
      products: {
        Row: {
          id: string;
          title: string;
          sub_title: string;
          description: string;
          images: string[];
          price: number;
          quantity: number;
          power: number;
          color: string[];
          color_quantity: { color: string; quantity: string; label: string }[];
          specifications: { [key: string]: string };
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          sub_title: string;
          description: string;
          images: string[];
          price: number;
          quantity: number;
          power: number;
          color: string[];
          color_quantity: { color: string; quantity: string; label: string }[];
          specifications: { [key: string]: string };
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          sub_title?: string;
          description?: string;
          images?: string[];
          price?: number;
          quantity?: number;
          power?: number;
          color?: string[];
          color_quantity?: { color: string; quantity: string; label: string }[];
          specifications?: { [key: string]: string };
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Inserts<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type Updates<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
