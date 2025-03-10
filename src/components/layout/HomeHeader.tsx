import { useState, useEffect, useCallback, memo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookmarkCheck, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/providers/UserProvider";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { NotificationBell } from "@/components/common/NotificationBell";

interface HomeHeaderProps {
  title?: string;
  subtitle?: string;
}

function HomeHeaderComponent({
  title,
  subtitle
}: HomeHeaderProps) {
  const [userName, setUserName] = useState("Usuário");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useUser();

  // Memoize the fetch function to avoid recreating it on every render
  const fetchUserProfile = useCallback(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase.from('profiles').select('username, full_name, avatar_url').eq('id', user.id).maybeSingle();
          if (data) {
            setUserName(data.full_name || data.username || user.email?.split('@')[0] || "Usuário");
            setAvatarUrl(data.avatar_url);
          } else {
            setUserName(user.email?.split('@')[0] || "Usuário");
          }
        }
      } catch (error) {
        console.error("Erro ao buscar perfil:", error);
      }
  }, []);
  
  // Use the memoized fetch function in useEffect
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Memoize the navigation handler
  const handleSettingsClick = useCallback(() => {
    navigate('/settings');
  }, [navigate]);
  
  // Memoize the favorites trigger handler
  const handleFavoritesClick = useCallback(() => {
    // Encontrar e clicar no botão que abre o diálogo de favoritos
    const favoritesButton = document.querySelector('[data-favorites-trigger="true"]');
    if (favoritesButton) {
      (favoritesButton as HTMLElement).click();
    } else {
      console.error("Botão de favoritos não encontrado");
    }
  }, []);

  const handleProfileClick = useCallback(() => {
    // Encontrar e clicar no avatar da barra lateral para abrir o menu
    const sidebarAvatar = document.querySelector('.sidebar-avatar-trigger');
    if (sidebarAvatar) {
      (sidebarAvatar as HTMLElement).click();
    }
  }, []);
  
  return (
    <header className="fixed top-0 left-0 right-0 bg-white z-10 border-b border-gray-100 shadow-sm">
      <div className="w-full max-w-2xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full overflow-hidden border border-gray-200 w-10 h-10 bg-white shadow-sm"
            onClick={handleProfileClick}
          >
            <Avatar className="w-9 h-9">
              <AvatarImage src={avatarUrl || undefined} alt={userName} />
              <AvatarFallback className="bg-violet-100 text-violet-800">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </div>
        
        <div className="flex gap-2 items-center">
          <ThemeToggle />
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full w-9 h-9 bg-white shadow-sm" 
            onClick={handleFavoritesClick}
          >
            <BookmarkCheck className="h-4 w-4 text-gray-700" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full w-9 h-9 bg-white shadow-sm" 
            onClick={handleSettingsClick} 
            data-testid="settings-button"
          >
            <Settings className="h-4 w-4 text-gray-700" />
          </Button>
          
          {/* Componente NotificationBell para substituir o botão de notificação simples */}
          <div className="rounded-full w-9 h-9 bg-white shadow-sm flex items-center justify-center">
            <NotificationBell />
          </div>
        </div>
      </div>
      
      {/* Hidden trigger for favorites */}
      <button id="favorites-trigger" className="hidden" onClick={() => {
        const suggestionsBox = document.querySelectorAll('button')[1]; // This should target the favorites button
        if (suggestionsBox) suggestionsBox.click();
      }} />
    </header>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const HomeHeader = memo(HomeHeaderComponent);
