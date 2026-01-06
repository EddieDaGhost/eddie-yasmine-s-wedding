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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      content: {
        Row: {
          created_at: string
          id: number
          key: string | null
          value: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          key?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          key?: string | null
          value?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          description: string | null
          end_time: string | null
          id: number
          location: string | null
          name: string | null
          start_time: string | null
        }
        Insert: {
          description?: string | null
          end_time?: string | null
          id?: number
          location?: string | null
          name?: string | null
          start_time?: string | null
        }
        Update: {
          description?: string | null
          end_time?: string | null
          id?: number
          location?: string | null
          name?: string | null
          start_time?: string | null
        }
        Relationships: []
      }
      guests: {
        Row: {
          attending: boolean | null
          created_at: string | null
          dietary_needs: string | null
          email: string
          id: string
          invite_code: string | null
          name: string | null
          plus_ones: number | null
        }
        Insert: {
          attending?: boolean | null
          created_at?: string | null
          dietary_needs?: string | null
          email: string
          id?: string
          invite_code?: string | null
          name?: string | null
          plus_ones?: number | null
        }
        Update: {
          attending?: boolean | null
          created_at?: string | null
          dietary_needs?: string | null
          email?: string
          id?: string
          invite_code?: string | null
          name?: string | null
          plus_ones?: number | null
        }
        Relationships: []
      }
      invite_analytics: {
        Row: {
          created_at: string
          event_type: string
          id: string
          invite_id: string
          metadata: Json | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          invite_id: string
          metadata?: Json | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          invite_id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "invite_analytics_invite_id_fkey"
            columns: ["invite_id"]
            isOneToOne: false
            referencedRelation: "invites"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          code: string
          created_at: string
          id: string
          label: string | null
          max_guests: number
          used_by: string | null
          venue_address: string | null
          venue_name: string | null
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          label?: string | null
          max_guests?: number
          used_by?: string | null
          venue_address?: string | null
          venue_name?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          label?: string | null
          max_guests?: number
          used_by?: string | null
          venue_address?: string | null
          venue_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invites_used_by_fkey"
            columns: ["used_by"]
            isOneToOne: false
            referencedRelation: "rsvps"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          approved: boolean | null
          content: string | null
          created_at: string
          guest_id: string | null
          id: string
        }
        Insert: {
          approved?: boolean | null
          content?: string | null
          created_at?: string
          guest_id?: string | null
          id?: string
        }
        Update: {
          approved?: boolean | null
          content?: string | null
          created_at?: string
          guest_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
        ]
      }
      photos: {
        Row: {
          approved: boolean | null
          caption: string | null
          created_at: string
          file_url: string | null
          guest_id: string
          id: string
          tags: string[] | null
        }
        Insert: {
          approved?: boolean | null
          caption?: string | null
          created_at?: string
          file_url?: string | null
          guest_id?: string
          id?: string
          tags?: string[] | null
        }
        Update: {
          approved?: boolean | null
          caption?: string | null
          created_at?: string
          file_url?: string | null
          guest_id?: string
          id?: string
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "song_requests_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
        ]
      }
      rsvps: {
        Row: {
          attending: boolean | null
          created_at: string
          email: string | null
          guests: number | null
          id: string
          invite_code: string | null
          meal_preference: string | null
          message: string | null
          name: string | null
          song_requests: string | null
        }
        Insert: {
          attending?: boolean | null
          created_at?: string
          email?: string | null
          guests?: number | null
          id?: string
          invite_code?: string | null
          meal_preference?: string | null
          message?: string | null
          name?: string | null
          song_requests?: string | null
        }
        Update: {
          attending?: boolean | null
          created_at?: string
          email?: string | null
          guests?: number | null
          id?: string
          invite_code?: string | null
          meal_preference?: string | null
          message?: string | null
          name?: string | null
          song_requests?: string | null
        }
        Relationships: []
      }
      song_requests: {
        Row: {
          artist: string | null
          created_at: string
          guest_id: string | null
          id: number
          title: string | null
        }
        Insert: {
          artist?: string | null
          created_at?: string
          guest_id?: string | null
          id?: number
          title?: string | null
        }
        Update: {
          artist?: string | null
          created_at?: string
          guest_id?: string | null
          id?: number
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "song_requests_guest_id_fkey1"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
