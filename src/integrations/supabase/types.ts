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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          body: string
          created_at: string | null
          created_by: string | null
          department_id: string | null
          id: string
          pinned: boolean | null
          semester_id: string | null
          title: string
        }
        Insert: {
          body?: string
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          id?: string
          pinned?: boolean | null
          semester_id?: string | null
          title: string
        }
        Update: {
          body?: string
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          id?: string
          pinned?: boolean | null
          semester_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          score: number
          topic_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          score: number
          topic_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          score?: number
          topic_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_submissions: {
        Row: {
          assignment_id: string
          created_at: string | null
          grade: number | null
          id: string
          status: string
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          assignment_id: string
          created_at?: string | null
          grade?: number | null
          id?: string
          status?: string
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          assignment_id?: string
          created_at?: string | null
          grade?: number | null
          id?: string
          status?: string
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          semester_id: string | null
          subject_id: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          semester_id?: string | null
          subject_id: string
          title: string
          type?: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          semester_id?: string | null
          subject_id?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          created_at: string | null
          date: string
          id: string
          semester_id: string | null
          status: string
          subject_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          semester_id?: string | null
          status: string
          subject_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          semester_id?: string | null
          status?: string
          subject_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
        ]
      }
      cgpa_records: {
        Row: {
          cgpa: number
          created_at: string | null
          id: string
          semester_id: string
          sgpa: number
          user_id: string
        }
        Insert: {
          cgpa?: number
          created_at?: string | null
          id?: string
          semester_id: string
          sgpa?: number
          user_id: string
        }
        Update: {
          cgpa?: number
          created_at?: string | null
          id?: string
          semester_id?: string
          sgpa?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cgpa_records_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      mentor_assignments: {
        Row: {
          assigned_at: string | null
          id: string
          mentor_id: string
          semester_id: string | null
          student_id: string
        }
        Insert: {
          assigned_at?: string | null
          id?: string
          mentor_id: string
          semester_id?: string | null
          student_id: string
        }
        Update: {
          assigned_at?: string | null
          id?: string
          mentor_id?: string
          semester_id?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_assignments_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
        ]
      }
      mentoring_notes: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          note_text: string
          session_id: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          note_text: string
          session_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          note_text?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentoring_notes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "mentoring_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      mentoring_sessions: {
        Row: {
          action_items: Json | null
          ai_summary: string | null
          created_at: string | null
          id: string
          mentor_id: string
          scheduled_at: string | null
          status: string | null
          student_id: string
          transcript: string | null
          updated_at: string | null
        }
        Insert: {
          action_items?: Json | null
          ai_summary?: string | null
          created_at?: string | null
          id?: string
          mentor_id: string
          scheduled_at?: string | null
          status?: string | null
          student_id: string
          transcript?: string | null
          updated_at?: string | null
        }
        Update: {
          action_items?: Json | null
          ai_summary?: string | null
          created_at?: string | null
          id?: string
          mentor_id?: string
          scheduled_at?: string | null
          status?: string | null
          student_id?: string
          transcript?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      parent_student_links: {
        Row: {
          created_at: string | null
          id: string
          parent_id: string
          student_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          parent_id: string
          student_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          parent_id?: string
          student_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          batch_year: number | null
          created_at: string
          department_id: string | null
          display_name: string | null
          enrollment_number: string | null
          id: string
          phone: string | null
          section: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          batch_year?: number | null
          created_at?: string
          department_id?: string | null
          display_name?: string | null
          enrollment_number?: string | null
          id?: string
          phone?: string | null
          section?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          batch_year?: number | null
          created_at?: string
          department_id?: string | null
          display_name?: string | null
          enrollment_number?: string | null
          id?: string
          phone?: string | null
          section?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      pulse_checks: {
        Row: {
          created_at: string | null
          id: string
          note: string | null
          rating: number
          semester_id: string | null
          user_id: string
          week_of: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          note?: string | null
          rating: number
          semester_id?: string | null
          user_id: string
          week_of: string
        }
        Update: {
          created_at?: string | null
          id?: string
          note?: string | null
          rating?: number
          semester_id?: string | null
          user_id?: string
          week_of?: string
        }
        Relationships: [
          {
            foreignKeyName: "pulse_checks_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
        ]
      }
      semester_subjects: {
        Row: {
          created_at: string | null
          id: string
          semester_id: string
          subject_id: string
          teacher_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          semester_id: string
          subject_id: string
          teacher_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          semester_id?: string
          subject_id?: string
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "semester_subjects_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
        ]
      }
      semesters: {
        Row: {
          created_at: string | null
          department_id: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          name: string
          semester_number: number
          start_date: string | null
          year: number
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          semester_number: number
          start_date?: string | null
          year: number
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          semester_number?: number
          start_date?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "semesters_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      student_sections: {
        Row: {
          batch_year: number
          created_at: string | null
          id: string
          section: string
          semester_id: string
          user_id: string
        }
        Insert: {
          batch_year: number
          created_at?: string | null
          id?: string
          section?: string
          semester_id: string
          user_id: string
        }
        Update: {
          batch_year?: number
          created_at?: string | null
          id?: string
          section?: string
          semester_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_sections_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
        ]
      }
      student_topic_mastery: {
        Row: {
          id: string
          last_practiced_at: string | null
          mastery: number
          topic_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          last_practiced_at?: string | null
          mastery?: number
          topic_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          last_practiced_at?: string | null
          mastery?: number
          topic_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_topic_mastery_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          code: string | null
          created_at: string
          department_id: string | null
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          code?: string | null
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      topic_notes: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          semester_id: string | null
          title: string
          topic_id: string
          updated_at: string | null
        }
        Insert: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          semester_id?: string | null
          title: string
          topic_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          semester_id?: string | null
          title?: string
          topic_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "topic_notes_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          created_at: string
          description: string | null
          difficulty: number
          id: string
          name: string
          order_index: number | null
          prerequisite_ids: string[]
          semester_id: string | null
          slug: string
          subject_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty?: number
          id?: string
          name: string
          order_index?: number | null
          prerequisite_ids?: string[]
          semester_id?: string | null
          slug: string
          subject_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty?: number
          id?: string
          name?: string
          order_index?: number | null
          prerequisite_ids?: string[]
          semester_id?: string | null
          slug?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topics_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      get_my_profile: {
        Args: never
        Returns: {
          avatar_url: string
          batch_year: number
          created_at: string
          department_id: string
          display_name: string
          enrollment_number: string
          id: string
          phone: string
          role: Database["public"]["Enums"]["app_role"]
          section: string
          updated_at: string
          user_id: string
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
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
      app_role: "admin" | "teacher" | "student" | "parent"
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
      app_role: ["admin", "teacher", "student", "parent"],
    },
  },
} as const
