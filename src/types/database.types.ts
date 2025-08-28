export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string | null
          created_at: string
          id: number
          module: string | null
          table: string | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string
          id?: number
          module?: string | null
          table?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string
          id?: number
          module?: string | null
          table?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      address: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          id: number
          is_primary: boolean | null
          state: string | null
          street: string | null
          user_id: string | null
          zip: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: number
          is_primary?: boolean | null
          state?: string | null
          street?: string | null
          user_id?: string | null
          zip?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: number
          is_primary?: boolean | null
          state?: string | null
          street?: string | null
          user_id?: string | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "address_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_detail: {
        Row: {
          created_at: string
          follow_us_tiktok: string | null
          id: number
          tiktok_link: string | null
        }
        Insert: {
          created_at?: string
          follow_us_tiktok?: string | null
          id?: number
          tiktok_link?: string | null
        }
        Update: {
          created_at?: string
          follow_us_tiktok?: string | null
          id?: number
          tiktok_link?: string | null
        }
        Relationships: []
      }
      colors: {
        Row: {
          created_at: string
          id: string
          name: string | null
          value: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          value?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          address_id: number | null
          color: string | null
          created_at: string
          id: string
          order_number: string | null
          product_id: string | null
          quantity: number | null
          status: number | null
          total_amount: number | null
          user_id: string | null
        }
        Insert: {
          address_id?: number | null
          color?: string | null
          created_at?: string
          id?: string
          order_number?: string | null
          product_id?: string | null
          quantity?: number | null
          status?: number | null
          total_amount?: number | null
          user_id?: string | null
        }
        Update: {
          address_id?: number | null
          color?: string | null
          created_at?: string
          id?: string
          order_number?: string | null
          product_id?: string | null
          quantity?: number | null
          status?: number | null
          total_amount?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "address"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_status_fkey"
            columns: ["status"]
            isOneToOne: false
            referencedRelation: "slug"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          color_quantity: Json | null
          created_at: string
          description: string | null
          id: string
          images: string | null
          power: number | null
          price: number | null
          primary_thumbnail: string | null
          specifications: Json | null
          sub_title: string | null
          title: string | null
        }
        Insert: {
          color_quantity?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string | null
          power?: number | null
          price?: number | null
          primary_thumbnail?: string | null
          specifications?: Json | null
          sub_title?: string | null
          title?: string | null
        }
        Update: {
          color_quantity?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string | null
          power?: number | null
          price?: number | null
          primary_thumbnail?: string | null
          specifications?: Json | null
          sub_title?: string | null
          title?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          mobile_number: string | null
          profile_completed: boolean | null
          role: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          mobile_number?: string | null
          profile_completed?: boolean | null
          role?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          mobile_number?: string | null
          profile_completed?: boolean | null
          role?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string
          id: number
          product_id: string | null
          rating: number | null
          review: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          product_id?: string | null
          rating?: number | null
          review?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          product_id?: string | null
          rating?: number | null
          review?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      slug: {
        Row: {
          created_at: string
          id: number
          name: string | null
          value: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          name?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string | null
          value?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_orders_and_update_stock: {
        Args: {
          p_address_id: number
          p_items: Json
          p_order_number: string
          p_user_id: string
        }
        Returns: undefined
      }
      get_all_products_with_types: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_available_products: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_my_orders: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_orders: {
        Args: { limit_value?: number; offset_value?: number }
        Returns: Json
      }
      get_orders_profiles_stats: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: Json
      }
      get_product_by_id: {
        Args: { pid: string }
        Returns: Json
      }
      get_product_details: {
        Args: { product_id: string }
        Returns: Json
      }
      get_products: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_products_by_type: {
        Args: {
          p_filter?: Json
          p_limit?: number
          p_page?: number
          p_type: string
        }
        Returns: Json
      }
      get_profiles_by_role: {
        Args: { p_limit?: number; p_page?: number; p_role: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
