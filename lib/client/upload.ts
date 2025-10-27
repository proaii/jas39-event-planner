import { createClient } from '@/lib/server/supabase/client'; 

const uniqueName = (name: string) => {
  const ext = name.split('.').pop() || 'jpg';
  return `${crypto.randomUUID()}.${ext}`;
};

export async function uploadEventCover(file: File) {
  const supabase = createClient();

  if (!file.type.startsWith('image/')) throw new Error('The file must be an image.');
  if (file.size > 5 * 1024 * 1024) throw new Error('The file must not exceed 5MB.');

  const fileName = uniqueName(file.name);
  const path = `covers/${fileName}`;

  const { error } = await supabase
    .storage
    .from('event-covers')
    .upload(path, file, { upsert: false }); 

  if (error) throw error;

  const { data: pub } = supabase.storage.from('event-covers').getPublicUrl(path);
  return { path, url: pub?.publicUrl ?? '' };
}