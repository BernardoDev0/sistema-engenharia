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
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json | null
          performed_by_user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
          performed_by_user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
          performed_by_user_id?: string
        }
        Relationships: []
      }
      contracts: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          end_date: string
          id: string
          project_id: string | null
          start_date: string
          status: Database["public"]["Enums"]["contract_status"]
          supplier_id: string
          title: string
          updated_at: string
          value: number
        }
        Insert: {
          created_at?: string
          currency: string
          description?: string | null
          end_date: string
          id?: string
          project_id?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["contract_status"]
          supplier_id: string
          title: string
          updated_at?: string
          value: number
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          end_date?: string
          id?: string
          project_id?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["contract_status"]
          supplier_id?: string
          title?: string
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "contracts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          category: string
          certification: string | null
          created_at: string
          id: string
          name: string
          quantity_in_use: number
          status: Database["public"]["Enums"]["equipment_status"]
          total_quantity: number
          updated_at: string
        }
        Insert: {
          category: string
          certification?: string | null
          created_at?: string
          id?: string
          name: string
          quantity_in_use?: number
          status?: Database["public"]["Enums"]["equipment_status"]
          total_quantity?: number
          updated_at?: string
        }
        Update: {
          category?: string
          certification?: string | null
          created_at?: string
          id?: string
          name?: string
          quantity_in_use?: number
          status?: Database["public"]["Enums"]["equipment_status"]
          total_quantity?: number
          updated_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          currency: string
          description: string | null
          id: string
          incurred_at: string
          project_id: string | null
          supplier_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          currency: string
          description?: string | null
          id?: string
          incurred_at: string
          project_id?: string | null
          supplier_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          incurred_at?: string
          project_id?: string | null
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          contract_id: string
          created_at: string
          currency: string
          document_url: string
          due_date: string
          id: string
          status: Database["public"]["Enums"]["invoice_status"]
          supplier_id: string
        }
        Insert: {
          amount: number
          contract_id: string
          created_at?: string
          currency: string
          document_url: string
          due_date: string
          id?: string
          status?: Database["public"]["Enums"]["invoice_status"]
          supplier_id: string
        }
        Update: {
          amount?: number
          contract_id?: string
          created_at?: string
          currency?: string
          document_url?: string
          due_date?: string
          id?: string
          status?: Database["public"]["Enums"]["invoice_status"]
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          created_at: string
          damage_comment: string | null
          equipment_id: string
          id: string
          quantity: number
          returned_at: string | null
          status: Database["public"]["Enums"]["loan_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          damage_comment?: string | null
          equipment_id: string
          id?: string
          quantity: number
          returned_at?: string | null
          status?: Database["public"]["Enums"]["loan_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          damage_comment?: string | null
          equipment_id?: string
          id?: string
          quantity?: number
          returned_at?: string | null
          status?: Database["public"]["Enums"]["loan_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loans_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          email: string
          id: string
          is_active: boolean
          kind: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          email: string
          id: string
          is_active?: boolean
          kind: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          email?: string
          id?: string
          is_active?: boolean
          kind?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_documents: {
        Row: {
          file_url: string
          id: string
          project_id: string
          uploaded_at: string
          uploaded_by_user_id: string
        }
        Insert: {
          file_url: string
          id?: string
          project_id: string
          uploaded_at?: string
          uploaded_by_user_id: string
        }
        Update: {
          file_url?: string
          id?: string
          project_id?: string
          uploaded_at?: string
          uploaded_by_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_documents_uploaded_by_user_id_fkey"
            columns: ["uploaded_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          created_at: string
          project_id: string
          role: Database["public"]["Enums"]["project_member_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          project_id: string
          role: Database["public"]["Enums"]["project_member_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          project_id?: string
          role?: Database["public"]["Enums"]["project_member_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_requirements: {
        Row: {
          created_at: string
          equipment_id: string
          id: string
          project_id: string
          required_quantity: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          equipment_id: string
          id?: string
          project_id: string
          required_quantity: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          equipment_id?: string
          id?: string
          project_id?: string
          required_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_requirements_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_requirements_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          client_name: string
          created_at: string
          created_by_admin_id: string
          description: string | null
          end_date: string | null
          id: string
          location: string | null
          name: string
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
          updated_at: string
        }
        Insert: {
          client_name: string
          created_at?: string
          created_by_admin_id: string
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          name: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
        }
        Update: {
          client_name?: string
          created_at?: string
          created_by_admin_id?: string
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          name?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_created_by_admin_id_fkey"
            columns: ["created_by_admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          certifications: string | null
          contact_info: string | null
          created_at: string
          id: string
          name: string
          service_type: Database["public"]["Enums"]["supplier_service_type"]
          status: Database["public"]["Enums"]["supplier_status"]
          updated_at: string
        }
        Insert: {
          certifications?: string | null
          contact_info?: string | null
          created_at?: string
          id?: string
          name: string
          service_type: Database["public"]["Enums"]["supplier_service_type"]
          status?: Database["public"]["Enums"]["supplier_status"]
          updated_at?: string
        }
        Update: {
          certifications?: string | null
          contact_info?: string | null
          created_at?: string
          id?: string
          name?: string
          service_type?: Database["public"]["Enums"]["supplier_service_type"]
          status?: Database["public"]["Enums"]["supplier_status"]
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
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
      app_role:
        | "ADMIN"
        | "OPERATIONS_MANAGER"
        | "FIELD_TECHNICIAN"
        | "COMPLIANCE_ESG"
      contract_status: "ACTIVE" | "EXPIRED" | "TERMINATED"
      equipment_status: "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "DISCARDED"
      invoice_status: "PENDING" | "PAID" | "OVERDUE"
      loan_status: "ACTIVE" | "RETURNED" | "DAMAGED"
      project_member_role: "LEAD" | "TECHNICIAN" | "SUPPORT"
      project_status:
        | "PLANNING"
        | "ACTIVE"
        | "ON_HOLD"
        | "COMPLETED"
        | "CANCELED"
      supplier_service_type:
        | "EQUIPMENT"
        | "MAINTENANCE"
        | "WASTE_DISPOSAL"
        | "CONSULTING"
      supplier_status: "ACTIVE" | "INACTIVE"
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
      app_role: [
        "ADMIN",
        "OPERATIONS_MANAGER",
        "FIELD_TECHNICIAN",
        "COMPLIANCE_ESG",
      ],
      contract_status: ["ACTIVE", "EXPIRED", "TERMINATED"],
      equipment_status: ["AVAILABLE", "IN_USE", "MAINTENANCE", "DISCARDED"],
      invoice_status: ["PENDING", "PAID", "OVERDUE"],
      loan_status: ["ACTIVE", "RETURNED", "DAMAGED"],
      project_member_role: ["LEAD", "TECHNICIAN", "SUPPORT"],
      project_status: [
        "PLANNING",
        "ACTIVE",
        "ON_HOLD",
        "COMPLETED",
        "CANCELED",
      ],
      supplier_service_type: [
        "EQUIPMENT",
        "MAINTENANCE",
        "WASTE_DISPOSAL",
        "CONSULTING",
      ],
      supplier_status: ["ACTIVE", "INACTIVE"],
    },
  },
} as const
