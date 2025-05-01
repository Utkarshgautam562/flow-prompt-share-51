
export interface Prompt {
  id: string;
  title: string;
  content: string;
  llm_settings: {
    model: string;
    temperature?: number;
  };
  user_id: string;
  created_at: string;
  is_public?: boolean;
  is_shared: boolean;
  profiles?: {
    username: string;
  };
}
