
// Use the 'export' keyword properly to make Collection available
export interface Collection {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  created_at: string;
  is_shared: boolean | null;
  share_id: string | null;
  profiles?: {
    username: string | null;
  } | null;
  type: 'collection'; // To differentiate from prompts
}
