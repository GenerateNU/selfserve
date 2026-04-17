export type View = {
  id: string;
  user_id: string;
  slug: string;
  display_name: string;
  filters: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type CreateViewInput = {
  slug: string;
  display_name: string;
  filters: Record<string, unknown>;
};
