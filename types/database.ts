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
          full_name: string | null
          avatar_url: string | null
          subscription_tier: string
          credits_remaining: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: string
          credits_remaining?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: string
          credits_remaining?: number
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          title: string
          mode: 'challenge' | 'debate' | 'analysis' | 'document'
          system_prompt: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          mode: 'challenge' | 'debate' | 'analysis' | 'document'
          system_prompt?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          mode?: 'challenge' | 'debate' | 'analysis' | 'document'
          system_prompt?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          metadata: Json
          tokens_used: number | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          metadata?: Json
          tokens_used?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: 'user' | 'assistant' | 'system'
          content?: string
          metadata?: Json
          tokens_used?: number | null
          created_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string | null
          file_url: string | null
          file_type: string | null
          file_size: number | null
          analysis_status: 'pending' | 'processing' | 'completed' | 'error'
          analysis_result: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content?: string | null
          file_url?: string | null
          file_type?: string | null
          file_size?: number | null
          analysis_status?: 'pending' | 'processing' | 'completed' | 'error'
          analysis_result?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string | null
          file_url?: string | null
          file_type?: string | null
          file_size?: number | null
          analysis_status?: 'pending' | 'processing' | 'completed' | 'error'
          analysis_result?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type ConversationMode = 'challenge' | 'debate' | 'analysis' | 'document'
export type MessageRole = 'user' | 'assistant' | 'system'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Document = Database['public']['Tables']['documents']['Row']