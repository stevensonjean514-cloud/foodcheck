export interface Database {
  public: {
    Tables: {
      restaurants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          description: string | null;
          created_at: string;
          is_community_submitted: boolean;
          cuisine_type: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          description?: string | null;
          created_at?: string;
          is_community_submitted?: boolean;
          cuisine_type?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          logo_url?: string | null;
          description?: string | null;
          created_at?: string;
          is_community_submitted?: boolean;
          cuisine_type?: string;
        };
      };
      menu_items: {
        Row: {
          id: string;
          restaurant_id: string;
          name: string;
          slug: string;
          description: string | null;
          category: string;
          official_photo_url: string;
          accuracy_score: number;
          total_votes: number;
          honest_votes: number;
          lie_votes: number;
          created_at: string;
          is_community_submitted: boolean;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          name: string;
          slug: string;
          description?: string | null;
          category?: string;
          official_photo_url: string;
          accuracy_score?: number;
          total_votes?: number;
          honest_votes?: number;
          lie_votes?: number;
          created_at?: string;
          is_community_submitted?: boolean;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          category?: string;
          official_photo_url?: string;
          accuracy_score?: number;
          total_votes?: number;
          honest_votes?: number;
          lie_votes?: number;
          created_at?: string;
          is_community_submitted?: boolean;
        };
      };
      reality_photos: {
        Row: {
          id: string;
          menu_item_id: string;
          photo_url: string;
          upvotes: number;
          downvotes: number;
          is_featured: boolean;
          uploaded_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          menu_item_id: string;
          photo_url: string;
          upvotes?: number;
          downvotes?: number;
          is_featured?: boolean;
          uploaded_by?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          menu_item_id?: string;
          photo_url?: string;
          upvotes?: number;
          downvotes?: number;
          is_featured?: boolean;
          uploaded_by?: string;
          created_at?: string;
        };
      };
      votes: {
        Row: {
          id: string;
          photo_id: string;
          vote_type: string;
          voter_ip: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          photo_id: string;
          vote_type: string;
          voter_ip?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          photo_id?: string;
          vote_type?: string;
          voter_ip?: string | null;
          created_at?: string;
        };
      };
      item_votes: {
        Row: {
          id: string;
          menu_item_id: string;
          vote_type: string;
          voter_session: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          menu_item_id: string;
          vote_type: string;
          voter_session: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          menu_item_id?: string;
          vote_type?: string;
          voter_session?: string;
          created_at?: string;
        };
      };
      uploads: {
        Row: {
          id: string;
          menu_item_id: string;
          username: string;
          photo_url: string;
          created_at: string;
          location_address: string | null;
          location_lat: number | null;
          location_lng: number | null;
          location_place_id: string | null;
          comment: string | null;
        };
        Insert: {
          id?: string;
          menu_item_id: string;
          username?: string;
          photo_url: string;
          created_at?: string;
          location_address?: string | null;
          location_lat?: number | null;
          location_lng?: number | null;
          location_place_id?: string | null;
          comment?: string | null;
        };
        Update: {
          id?: string;
          menu_item_id?: string;
          username?: string;
          photo_url?: string;
          created_at?: string;
          location_address?: string | null;
          location_lat?: number | null;
          location_lng?: number | null;
          location_place_id?: string | null;
          comment?: string | null;
        };
      };
    };
  };
}

export type Restaurant = Database['public']['Tables']['restaurants']['Row'];
export type MenuItem = Database['public']['Tables']['menu_items']['Row'];
export type RealityPhoto = Database['public']['Tables']['reality_photos']['Row'];
export type Vote = Database['public']['Tables']['votes']['Row'];
export type Upload = Database['public']['Tables']['uploads']['Row'];

export interface MenuItemWithRestaurant extends MenuItem {
  restaurant: Restaurant;
  reality_photos: RealityPhoto[];
}
