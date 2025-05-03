
export interface Collection {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  created_at: string;
  is_shared: boolean;
  share_id?: string;
  profiles?: {
    username: string | null;
  } | null;
  type: 'collection'; // Type discriminator
}
