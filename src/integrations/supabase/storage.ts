
import { supabase } from "./client";

// Função para garantir que o bucket de imagens de perfil existe
export const ensureProfileImagesBucketExists = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.log('Usuário não autenticado. Não é possível criar bucket.');
      return;
    }

    const { data: buckets } = await supabase.storage.listBuckets();
    
    // Verifica se o bucket já existe
    const bucketExists = buckets?.some(bucket => bucket.name === 'profile_images');
    
    if (!bucketExists) {
      // Cria o bucket se ele não existir
      const { error } = await supabase.storage.createBucket('profile_images', {
        public: true // Permite acesso público às imagens
      });
      
      if (error) {
        console.error('Erro ao criar bucket de imagens:', error);
      } else {
        console.log('Bucket de imagens de perfil criado com sucesso!');
      }
    }
  } catch (error) {
    console.error('Erro ao verificar buckets:', error);
  }
};

// Função para fazer upload de imagem de perfil
export const uploadProfileImage = async (file: File): Promise<string | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('profile_images')
      .upload(`public/${fileName}`, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    const { data: urlData } = supabase.storage
      .from('profile_images')
      .getPublicUrl(`public/${fileName}`);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Erro ao fazer upload de imagem:', error);
    return null;
  }
};
