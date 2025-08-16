export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'user' | 'admin' | 'student'

export type Database = {
  public: {
    Enums: {
      user_role: UserRole;
    };
    Functions: {
      is_admin: {
        Args: {
          user_id: string;
        };
        Returns: boolean;
      };
    };
    Tables: {
      admin_tasks: {
        Row: {
          assigned_to: string | null;
          created_at: string;
          id: string;
          notes: string | null;
          status: string;
          tts_request_id: string;
          updated_at: string;
        };
        Insert: {
          assigned_to?: string | null;
          created_at?: string;
          id?: string;
          notes?: string | null;
          status?: string;
          tts_request_id: string;
          updated_at?: string;
        };
        Update: {
          assigned_to?: string | null;
          created_at?: string;
          id?: string;
          notes?: string | null;
          status?: string;
          tts_request_id?: string;
          updated_at?: string;
        };
      };
      credit_plans: {
        Row: {
          created_at: string;
          credits_included: number;
          duration_days: number | null;
          id: string;
          name: string;
          price: number;
        };
        Insert: {
          created_at?: string;
          credits_included: number;
          duration_days?: number | null;
          id?: string;
          name: string;
          price?: number;
        };
        Update: {
          created_at?: string;
          credits_included?: number;
          duration_days?: number | null;
          id?: string;
          name?: string;
          price?: number;
        };
      };
      document_regions: {
        Row: {
          created_at: string;
          description: string | null;
          document_id: string;
          height: number;
          id: string;
          name: string;
          page: number;
          type: string;
          user_id: string;
          width: number;
          x: number;
          y: number;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          document_id: string;
          height: number;
          id?: string;
          name: string;
          page: number;
          type: string;
          user_id: string;
          width: number;
          x: number;
          y: number;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          document_id?: string;
          height?: number;
          id?: string;
          name?: string;
          page?: number;
          type?: string;
          user_id?: string;
          width?: number;
          x?: number;
          y?: number;
        };
      };
      document_texts: {
        Row: {
          assigned_region_id: string | null;
          content: string;
          created_at: string;
          document_id: string;
          id: string;
          order_index: number;
          page: number;
          title: string;
          user_id: string;
        };
        Insert: {
          assigned_region_id?: string | null;
          content: string;
          created_at?: string;
          document_id: string;
          id?: string;
          order_index: number;
          page?: number;
          title: string;
          user_id: string;
        };
        Update: {
          assigned_region_id?: string | null;
          content?: string;
          created_at?: string;
          document_id?: string;
          id?: string;
          order_index?: number;
          page?: number;
          title?: string;
          user_id?: string;
        };
      };
      documents: {
        Row: {
          created_at: string;
          drm_protected_pages: Json | null;
          folder_id: string | null;
          id: string;
          is_private: boolean;
          metadata: Json | null;
          name: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          drm_protected_pages?: Json | null;
          folder_id?: string | null;
          id?: string;
          is_private?: boolean;
          metadata?: Json | null;
          name: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          drm_protected_pages?: Json | null;
          folder_id?: string | null;
          id?: string;
          is_private?: boolean;
          metadata?: Json | null;
          name?: string;
          user_id?: string | null;
        };
      };
      folders: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
      notifications: {
        Row: {
          created_at: string;
          id: string;
          is_read: boolean;
          link: string | null;
          message: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_read?: boolean;
          link?: string | null;
          message: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_read?: boolean;
          link?: string | null;
          message?: string;
          user_id?: string;
        };
      };
      text_assignments: {
        Row: {
          created_at: string;
          document_id: string;
          id: string;
          region_id: string;
          text_content: string;
          text_title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          document_id: string;
          id?: string;
          region_id: string;
          text_content: string;
          text_title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          document_id?: string;
          id?: string;
          region_id?: string;
          text_content?: string;
          text_title?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
      tts_audio_files: {
        Row: {
          created_at: string;
          duration_seconds: number | null;
          file_size: number | null;
          id: string;
          page_number: number;
          storage_path: string;
          status: string;
          tts_request_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          duration_seconds?: number | null;
          file_size?: number | null;
          id?: string;
          page_number: number;
          storage_path: string;
          status?: string;
          tts_request_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          duration_seconds?: number | null;
          file_size?: number | null;
          id?: string;
          page_number?: number;
          storage_path?: string;
          status?: string;
          tts_request_id?: string;
          updated_at?: string;
        };
      };
      tts_requests: {
        Row: {
          cost_in_credits: number;
          created_at: string;
          document_id: string;
          extra_cost_da: number | null;
          final_audio_path: string | null;
          id: string;
          requested_pages: number[];
          status: string;
          updated_at: string;
          user_id: string;
          voice_type: string | null;
        };
        Insert: {
          cost_in_credits: number;
          created_at?: string;
          document_id: string;
          extra_cost_da?: number | null;
          final_audio_path?: string | null;
          id?: string;
          requested_pages: number[];
          status?: string;
          updated_at?: string;
          user_id: string;
          voice_type?: string | null;
        };
        Update: {
          cost_in_credits?: number;
          created_at?: string;
          document_id?: string;
          extra_cost_da?: number | null;
          final_audio_path?: string | null;
          id?: string;
          requested_pages?: number[];
          status?: string;
          updated_at?: string;
          user_id?: string;
          voice_type?: string | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: UserRole;
          created_at: string;
          plan_id: string | null;
          credits_remaining: number;
          onboarding_completed: boolean;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: UserRole;
          created_at?: string;
          plan_id?: string | null;
          credits_remaining?: number;
          onboarding_completed?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: UserRole;
          created_at?: string;
          plan_id?: string | null;
          credits_remaining?: number;
          onboarding_completed?: boolean;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};