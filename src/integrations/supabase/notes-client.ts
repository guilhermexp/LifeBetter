
import { supabase } from './client';

// This extends the functionality of the Supabase client specifically for notes
// without modifying the base types

interface NoteRecord {
  id?: string;
  title: string;
  description?: string | null;
  is_today?: boolean | null;
  has_due_date?: boolean | null;
  is_priority?: boolean | null;
  has_reminder?: boolean | null;
  category?: string | null;
  user_id: string;
  created_at?: string | null;
}

// Use these functions to handle notes-specific operations
export const notesClient = {
  insert: async (noteData: Omit<NoteRecord, 'id'>) => {
    return await supabase.from('notes').insert(noteData as any);
  },
  
  getByUserId: async (userId: string) => {
    return await supabase.from('notes').select('*').eq('user_id', userId) as any;
  },
  
  update: async (id: string, updates: Partial<NoteRecord>) => {
    return await supabase.from('notes').update(updates as any).eq('id', id);
  },
  
  delete: async (id: string) => {
    return await supabase.from('notes').delete().eq('id', id);
  }
};
