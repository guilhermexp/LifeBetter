
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ImageUpload } from "@/components/features/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ensureProfileImagesBucketExists } from "@/integrations/supabase/storage";

interface ProfileData {
  username: string;
  full_name: string;
  avatar_url: string | null;
  bio: string;
}

export default function ProfileEdit() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    username: "",
    full_name: "",
    avatar_url: null,
    bio: ""
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Garantir que o bucket de imagens exista
    ensureProfileImagesBucketExists();
    
    // Carregar perfil do usuário
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      // Primeiro, tentamos obter o perfil existente
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      // Se o perfil não existir, vamos criar um novo
      if (error || !data) {
        console.log("Perfil não encontrado, criando um novo");
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: user.id,
              username: user.email?.split('@')[0] || "",
              full_name: ""
            }
          ]);
          
        if (insertError) {
          console.error("Erro ao criar perfil:", insertError);
          throw insertError;
        }
        
        // Define valores padrão para um novo perfil
        setProfile({
          username: user.email?.split('@')[0] || "",
          full_name: "",
          avatar_url: null,
          bio: ""
        });
      } else {
        // Usa os dados do perfil existente
        setProfile({
          username: data.username || "",
          full_name: data.full_name || "",
          avatar_url: data.avatar_url,
          bio: data.bio || ""
        });
      }
    } catch (error: any) {
      console.error('Erro ao carregar perfil:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os dados do perfil."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          username: profile.username,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          bio: profile.bio
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Suas alterações foram salvas com sucesso."
      });

      navigate('/');
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o perfil."
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8 px-4">
      <Button
        variant="ghost"
        className="mb-6 gap-2"
        onClick={() => navigate(-1)}
        type="button"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>

      <h1 className="text-2xl font-bold mb-8">Editar Perfil</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex justify-center mb-8">
          <ImageUpload
            currentImageUrl={profile.avatar_url}
            onUploadComplete={(url) => setProfile(prev => ({ ...prev, avatar_url: url }))}
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Nome de usuário</Label>
            <Input
              id="username"
              value={profile.username}
              onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
              placeholder="@username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Nome completo</Label>
            <Input
              id="fullName"
              value={profile.full_name}
              onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
              placeholder="Seu nome completo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biografia</Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Conte um pouco sobre você..."
              className="min-h-[100px]"
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full gap-2" 
          disabled={saving}
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? "Salvando..." : "Salvar alterações"}
        </Button>
      </form>
    </div>
  );
}
