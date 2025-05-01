
export interface Prompt {
  id: string;
  title: string;
  content: string;
  llm_settings: {
    model: string;
  };
  user_id: string;
  created_at: string;
  profiles?: {
    username: string;
  };
}
