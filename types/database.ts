/**
 * Database types
 * These types should be generated from your Supabase schema
 * Run: npm run supabase:generate-types
 * 
 * For now, we'll define basic types manually
 */

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
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          polar_product_id: string | null
          name: string
          description: string | null
          price_amount: number
          interval: 'month' | 'year'
          features: Json
          is_active: boolean
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          polar_product_id?: string | null
          name: string
          description?: string | null
          price_amount: number
          interval: 'month' | 'year'
          features?: Json
          is_active?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          polar_product_id?: string | null
          name?: string
          description?: string | null
          price_amount?: number
          interval?: 'month' | 'year'
          features?: Json
          is_active?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          product_id: string | null
          polar_subscription_id: string | null
          status:
            | 'active'
            | 'canceled'
            | 'past_due'
            | 'unpaid'
            | 'trialing'
            | 'incomplete'
            | 'incomplete_expired'
            | 'paused'
          cancel_at_period_end: boolean
          current_period_start: string | null
          current_period_end: string | null
          trial_start: string | null
          trial_end: string | null
          canceled_at: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id?: string | null
          polar_subscription_id?: string | null
          status:
            | 'active'
            | 'canceled'
            | 'past_due'
            | 'unpaid'
            | 'trialing'
            | 'incomplete'
            | 'incomplete_expired'
            | 'paused'
          cancel_at_period_end?: boolean
          current_period_start?: string | null
          current_period_end?: string | null
          trial_start?: string | null
          trial_end?: string | null
          canceled_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string | null
          polar_subscription_id?: string | null
          status?:
            | 'active'
            | 'canceled'
            | 'past_due'
            | 'unpaid'
            | 'trialing'
            | 'incomplete'
            | 'incomplete_expired'
            | 'paused'
          cancel_at_period_end?: boolean
          current_period_start?: string | null
          current_period_end?: string | null
          trial_start?: string | null
          trial_end?: string | null
          canceled_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      usage_records: {
        Row: {
          id: string
          user_id: string
          subscription_id: string | null
          metric: string
          quantity: number
          metadata: Json
          recorded_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription_id?: string | null
          metric: string
          quantity?: number
          metadata?: Json
          recorded_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subscription_id?: string | null
          metric?: string
          quantity?: number
          metadata?: Json
          recorded_at?: string
        }
      }
      webhook_events: {
        Row: {
          id: string
          event_id: string
          event_type: string
          payload: Json
          processed: boolean
          processed_at: string | null
          error: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          event_type: string
          payload: Json
          processed?: boolean
          processed_at?: string | null
          error?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          event_type?: string
          payload?: Json
          processed?: boolean
          processed_at?: string | null
          error?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_active_subscription: {
        Args: { user_uuid: string }
        Returns: {
          id: string
          product_id: string
          status: string
          current_period_end: string
        }[]
      }
      user_has_feature: {
        Args: { user_uuid: string; feature_name: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
