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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      banner_designs: {
        Row: {
          banner_size: string
          banner_url_png_1: string
          banner_url_png_2: string | null
          banner_url_png_3: string | null
          color_scheme: string
          created_at: string
          cta_text: string | null
          custom_height: number | null
          custom_width: number | null
          headline: string
          id: string
          input_type: string
          plan_id: string | null
          primary_color: string | null
          prompt_used: string | null
          reference_image_data: string | null
          secondary_color: string | null
          style_theme: string
          subheadline: string | null
          text_description: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          banner_size: string
          banner_url_png_1: string
          banner_url_png_2?: string | null
          banner_url_png_3?: string | null
          color_scheme: string
          created_at?: string
          cta_text?: string | null
          custom_height?: number | null
          custom_width?: number | null
          headline: string
          id?: string
          input_type: string
          plan_id?: string | null
          primary_color?: string | null
          prompt_used?: string | null
          reference_image_data?: string | null
          secondary_color?: string | null
          style_theme: string
          subheadline?: string | null
          text_description?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          banner_size?: string
          banner_url_png_1?: string
          banner_url_png_2?: string | null
          banner_url_png_3?: string | null
          color_scheme?: string
          created_at?: string
          cta_text?: string | null
          custom_height?: number | null
          custom_width?: number | null
          headline?: string
          id?: string
          input_type?: string
          plan_id?: string | null
          primary_color?: string | null
          prompt_used?: string | null
          reference_image_data?: string | null
          secondary_color?: string | null
          style_theme?: string
          subheadline?: string | null
          text_description?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "banner_designs_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "business_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      business_ideas: {
        Row: {
          created_at: string
          detected_language: string | null
          id: string
          input_method: string
          original_text: string | null
          product_image_url: string | null
          refined_idea: string | null
          updated_at: string
          user_id: string
          voice_recording_url: string | null
        }
        Insert: {
          created_at?: string
          detected_language?: string | null
          id?: string
          input_method: string
          original_text?: string | null
          product_image_url?: string | null
          refined_idea?: string | null
          updated_at?: string
          user_id: string
          voice_recording_url?: string | null
        }
        Update: {
          created_at?: string
          detected_language?: string | null
          id?: string
          input_method?: string
          original_text?: string | null
          product_image_url?: string | null
          refined_idea?: string | null
          updated_at?: string
          user_id?: string
          voice_recording_url?: string | null
        }
        Relationships: []
      }
      business_plans: {
        Row: {
          business_name: string
          competitive_advantage: string | null
          created_at: string
          executive_summary: string | null
          financial_projections: string | null
          id: string
          idea_id: string | null
          implementation_timeline: string | null
          market_analysis: string | null
          marketing_strategy: string | null
          operations_plan: string | null
          revenue_model: string | null
          risk_analysis: string | null
          status: string | null
          tagline: string | null
          target_customers: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          business_name: string
          competitive_advantage?: string | null
          created_at?: string
          executive_summary?: string | null
          financial_projections?: string | null
          id?: string
          idea_id?: string | null
          implementation_timeline?: string | null
          market_analysis?: string | null
          marketing_strategy?: string | null
          operations_plan?: string | null
          revenue_model?: string | null
          risk_analysis?: string | null
          status?: string | null
          tagline?: string | null
          target_customers?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          business_name?: string
          competitive_advantage?: string | null
          created_at?: string
          executive_summary?: string | null
          financial_projections?: string | null
          id?: string
          idea_id?: string | null
          implementation_timeline?: string | null
          market_analysis?: string | null
          marketing_strategy?: string | null
          operations_plan?: string | null
          revenue_model?: string | null
          risk_analysis?: string | null
          status?: string | null
          tagline?: string | null
          target_customers?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_plans_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "business_ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          created_at: string
          customization_notes: string | null
          id: string
          product_id: string
          quantity: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          customization_notes?: string | null
          id?: string
          product_id: string
          quantity?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          customization_notes?: string | null
          id?: string
          product_id?: string
          quantity?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_requests: {
        Row: {
          buyer_id: string
          created_at: string
          description: string
          estimated_delivery_days: number | null
          id: string
          proposed_budget: number | null
          reference_images: string[] | null
          seller_id: string
          seller_notes: string | null
          seller_quote: number | null
          status: string | null
          updated_at: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          description: string
          estimated_delivery_days?: number | null
          id?: string
          proposed_budget?: number | null
          reference_images?: string[] | null
          seller_id: string
          seller_notes?: string | null
          seller_quote?: number | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          description?: string
          estimated_delivery_days?: number | null
          id?: string
          proposed_budget?: number | null
          reference_images?: string[] | null
          seller_id?: string
          seller_notes?: string | null
          seller_quote?: number | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_requests_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      design_assets: {
        Row: {
          asset_type: string
          asset_url: string
          created_at: string
          id: string
          plan_id: string | null
          prompt_used: string | null
          user_id: string
        }
        Insert: {
          asset_type: string
          asset_url: string
          created_at?: string
          id?: string
          plan_id?: string | null
          prompt_used?: string | null
          user_id: string
        }
        Update: {
          asset_type?: string
          asset_url?: string
          created_at?: string
          id?: string
          plan_id?: string | null
          prompt_used?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "design_assets_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "business_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_content: {
        Row: {
          content_text: string
          content_type: string | null
          created_at: string
          hashtags: string[] | null
          id: string
          image_data: string | null
          input_type: string | null
          plan_id: string | null
          platform: string | null
          user_id: string
        }
        Insert: {
          content_text: string
          content_type?: string | null
          created_at?: string
          hashtags?: string[] | null
          id?: string
          image_data?: string | null
          input_type?: string | null
          plan_id?: string | null
          platform?: string | null
          user_id: string
        }
        Update: {
          content_text?: string
          content_type?: string | null
          created_at?: string
          hashtags?: string[] | null
          id?: string
          image_data?: string | null
          input_type?: string | null
          plan_id?: string | null
          platform?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_content_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "business_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          customization_notes: string | null
          id: string
          order_id: string
          product_id: string | null
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          customization_notes?: string | null
          id?: string
          order_id: string
          product_id?: string | null
          quantity: number
          unit_price: number
        }
        Update: {
          created_at?: string
          customization_notes?: string | null
          id?: string
          order_id?: string
          product_id?: string | null
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          notes: string | null
          seller_id: string
          shipping_address: Json
          status: string | null
          stripe_payment_intent_id: string | null
          stripe_payment_status: string | null
          total_amount: number
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          notes?: string | null
          seller_id: string
          shipping_address: Json
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_payment_status?: string | null
          total_amount: number
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          seller_id?: string
          shipping_address?: Json
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_payment_status?: string | null
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          is_primary: boolean | null
          product_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          is_primary?: boolean | null
          product_id: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          is_primary?: boolean | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          ai_suggested_price: number | null
          category: string
          craft_heritage: string | null
          created_at: string
          creation_time_hours: number | null
          currency: string | null
          customization_options: Json | null
          description: string | null
          id: string
          is_customizable: boolean | null
          latitude: number | null
          longitude: number | null
          materials_used: string[] | null
          price: number
          seller_id: string
          status: string | null
          stock_quantity: number | null
          story: string | null
          title: string
          updated_at: string
        }
        Insert: {
          ai_suggested_price?: number | null
          category: string
          craft_heritage?: string | null
          created_at?: string
          creation_time_hours?: number | null
          currency?: string | null
          customization_options?: Json | null
          description?: string | null
          id?: string
          is_customizable?: boolean | null
          latitude?: number | null
          longitude?: number | null
          materials_used?: string[] | null
          price: number
          seller_id: string
          status?: string | null
          stock_quantity?: number | null
          story?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          ai_suggested_price?: number | null
          category?: string
          craft_heritage?: string | null
          created_at?: string
          creation_time_hours?: number | null
          currency?: string | null
          customization_options?: Json | null
          description?: string | null
          id?: string
          is_customizable?: boolean | null
          latitude?: number | null
          longitude?: number | null
          materials_used?: string[] | null
          price?: number
          seller_id?: string
          status?: string | null
          stock_quantity?: number | null
          story?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          business_name: string | null
          business_type: string | null
          created_at: string
          id: string
          location: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          business_name?: string | null
          business_type?: string | null
          created_at?: string
          id?: string
          location?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          business_name?: string | null
          business_type?: string | null
          created_at?: string
          id?: string
          location?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          buyer_id: string
          comment: string | null
          created_at: string
          id: string
          images: string[] | null
          order_id: string | null
          product_id: string
          rating: number
        }
        Insert: {
          buyer_id: string
          comment?: string | null
          created_at?: string
          id?: string
          images?: string[] | null
          order_id?: string | null
          product_id: string
          rating: number
        }
        Update: {
          buyer_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          images?: string[] | null
          order_id?: string | null
          product_id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_profiles: {
        Row: {
          artisan_story: string | null
          craft_specialty: string[] | null
          created_at: string
          id: string
          is_verified: boolean | null
          latitude: number | null
          longitude: number | null
          rating: number | null
          shop_name: string
          shop_tagline: string | null
          social_links: Json | null
          total_sales: number | null
          updated_at: string
          user_id: string
          years_of_experience: number | null
        }
        Insert: {
          artisan_story?: string | null
          craft_specialty?: string[] | null
          created_at?: string
          id?: string
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          rating?: number | null
          shop_name: string
          shop_tagline?: string | null
          social_links?: Json | null
          total_sales?: number | null
          updated_at?: string
          user_id: string
          years_of_experience?: number | null
        }
        Update: {
          artisan_story?: string | null
          craft_specialty?: string[] | null
          created_at?: string
          id?: string
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          rating?: number | null
          shop_name?: string
          shop_tagline?: string | null
          social_links?: Json | null
          total_sales?: number | null
          updated_at?: string
          user_id?: string
          years_of_experience?: number | null
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          category: string
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          rating: number | null
          state: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          address?: string | null
          category: string
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          rating?: number | null
          state?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          address?: string | null
          category?: string
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          rating?: number | null
          state?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "buyer" | "seller" | "admin"
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
    Enums: {
      app_role: ["buyer", "seller", "admin"],
    },
  },
} as const
