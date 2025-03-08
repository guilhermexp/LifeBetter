
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ImageUploadProps {
  currentImageUrl?: string | null;
  onUploadComplete: (url: string) => void;
}

export const ImageUpload = ({ currentImageUrl, onUploadComplete }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      
      if (!file) {
        setUploading(false);
        return;
      }

      // Validar o tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: "Erro no upload",
          description: "Por favor, selecione apenas arquivos de imagem."
        });
        setUploading(false);
        return;
      }

      // Validar o tamanho do arquivo (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Arquivo muito grande",
          description: "O tamanho máximo permitido é 5MB."
        });
        setUploading(false);
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      console.log('Iniciando upload do arquivo:', fileName);

      // Upload do arquivo
      const { data, error } = await supabase.storage
        .from('profile_images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Erro no upload:', error);
        toast({
          variant: "destructive",
          title: "Erro no upload",
          description: error.message || "Não foi possível fazer o upload da imagem."
        });
        setUploading(false);
        return;
      }

      console.log('Upload concluído:', data);

      // Obter a URL pública da imagem
      const { data: { publicUrl } } = supabase.storage
        .from('profile_images')
        .getPublicUrl(fileName);

      console.log('URL da imagem:', publicUrl);
      
      // Notificar o componente pai sobre o upload concluído
      onUploadComplete(publicUrl);
      
      toast({
        title: "Sucesso!",
        description: "Sua foto de perfil foi atualizada."
      });
    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast({
        variant: "destructive",
        title: "Erro no upload",
        description: error.message || "Não foi possível fazer o upload da imagem."
      });
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Previne a propagação do evento para evitar navegação
    e.preventDefault();
    e.stopPropagation();
    
    // Aciona o input de arquivo
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="h-32 w-32 ring-2 ring-purple-100 shadow-lg">
        {currentImageUrl ? (
          <AvatarImage src={currentImageUrl} alt="Foto de perfil" />
        ) : null}
        <AvatarFallback>
          <User2 className="h-12 w-12" />
        </AvatarFallback>
      </Avatar>
      
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleUpload}
      />
      
      <Button 
        variant="outline"
        className="gap-2"
        disabled={uploading}
        onClick={handleButtonClick}
        type="button" // Explicitamente definindo como button para evitar submit em formulários
      >
        <Upload className="h-4 w-4" />
        {uploading ? "Enviando..." : "Alterar foto"}
      </Button>
    </div>
  );
};
