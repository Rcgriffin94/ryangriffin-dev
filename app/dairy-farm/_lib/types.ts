export type Database = {
  public: {
    Tables: {
      gallon_bags: {
        Row: GallonBag;
        Insert: Omit<GallonBag, 'id' | 'created_at'>;
        Update: Partial<Omit<GallonBag, 'id' | 'created_at'>>;
      };
      loose_bags: {
        Row: LooseBag;
        Insert: Omit<LooseBag, 'id' | 'created_at'>;
        Update: Partial<Omit<LooseBag, 'id' | 'created_at'>>;
      };
    };
  };
};

export type GallonBag = {
  id: string;
  bag_number: string;
  pump_date: string;
  total_bags: number;
  remaining_bags: number;
  note: string | null;
  created_at: string;
};

export type LooseBag = {
  id: string;
  pump_date: string;
  count: number;
  note: string | null;
  created_at: string;
};
