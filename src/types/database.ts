export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          role: 'user' | 'admin'
          is_active: boolean
          email_verified: boolean
          last_login_at: string | null
          created_at: string
          updated_at: string
          metadata: Json | null
        }
        Insert: {
          id: string
          email: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin'
          is_active?: boolean
          email_verified?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin'
          is_active?: boolean
          email_verified?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
          metadata?: Json | null
        }
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          session_token: string
          ip_address: string | null
          user_agent: string | null
          is_active: boolean
          expires_at: string
          created_at: string
          last_accessed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_token: string
          ip_address?: string | null
          user_agent?: string | null
          is_active?: boolean
          expires_at: string
          created_at?: string
          last_accessed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_token?: string
          ip_address?: string | null
          user_agent?: string | null
          is_active?: boolean
          expires_at?: string
          created_at?: string
          last_accessed_at?: string
        }
      }
      password_reset_tokens: {
        Row: {
          id: string
          user_id: string
          token_hash: string
          expires_at: string
          used_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          token_hash: string
          expires_at: string
          used_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          token_hash?: string
          expires_at?: string
          used_at?: string | null
          created_at?: string
        }
      }
      login_attempts: {
        Row: {
          id: string
          email: string
          ip_address: string
          success: boolean
          attempted_at: string
          user_agent: string | null
        }
        Insert: {
          id?: string
          email: string
          ip_address: string
          success: boolean
          attempted_at?: string
          user_agent?: string | null
        }
        Update: {
          id?: string
          email?: string
          ip_address?: string
          success?: boolean
          attempted_at?: string
          user_agent?: string | null
        }
      }
      worksheets: {
        Row: {
          id: string
          document_name: string
          document_id: string
          drm_protected: boolean | null
          drm_protected_pages: number[] | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          document_name: string
          document_id?: string
          drm_protected?: boolean | null
          drm_protected_pages?: number[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          document_name?: string
          document_id?: string
          drm_protected?: boolean | null
          drm_protected_pages?: number[] | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      regions: {
        Row: {
          id: string
          worksheet_id: string
          page: number
          x: number
          y: number
          width: number
          height: number
          type: string
          name: string
          description: string[] | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          worksheet_id: string
          page: number
          x: number
          y: number
          width: number
          height: number
          type?: string
          name: string
          description?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          worksheet_id?: string
          page?: number
          x?: number
          y?: number
          width?: number
          height?: number
          type?: string
          name?: string
          description?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: {
          user_email: string
          client_ip: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      cleanup_expired_tokens: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      user_role: 'user' | 'admin'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}