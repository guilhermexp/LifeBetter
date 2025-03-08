
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Settings, LogOut, ChevronRight, CreditCard, HelpCircle, Bell, Mail, User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function UserDrawer() {
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const {
          data: {
            user
          }
        } = await supabase.auth.getUser();
        if (user) {
          const {
            data
          } = await supabase.from('profiles').select('username, full_name, avatar_url').eq('id', user.id).maybeSingle();
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
    };
    fetchUserProfile();
  }, [open]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    navigate('/auth');
  };

  const handleEditProfile = () => {
    setOpen(false);
    navigate('/profileEdit');
  };

  return <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          className="hidden" 
          data-drawer-trigger="user"
          onClick={() => setOpen(true)}
        >
          Open User Menu
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-full max-w-xs border-r-0 shadow-xl h-full flex flex-col bg-gradient-to-b from-gray-50 to-white">
        <div className="relative overflow-hidden">
          <div className="bg-gradient-to-r from-primary/90 to-secondary/90 h-32 w-full absolute top-0 left-0"></div>
          <div className="bg-[url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070')] bg-cover bg-center opacity-30 h-32 w-full absolute top-0 left-0"></div>
          
          <SheetHeader className="relative z-10 pt-6 pb-10 px-5">
            <div className="flex flex-col items-center">
              <Avatar className="h-16 w-16 border-4 border-white shadow-md mb-3">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="bg-primary/90 text-white text-xl">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <SheetTitle className="text-white text-xl font-bold mb-1">{userName}</SheetTitle>
                <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/20 rounded-full text-xs py-1 px-3 h-auto flex items-center gap-1 font-normal" onClick={handleEditProfile}>
                  <User className="h-3 w-3 mr-1" /> Editar perfil <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </SheetHeader>
        </div>
        
        <div className="flex-grow flex flex-col justify-between overflow-y-auto mt-4 px-2">
          <div className="space-y-1 w-full">
            <MenuButton icon={Settings} label="Configurações" onClick={() => {
            setOpen(false);
            navigate('/settings');
          }} />
            
            <MenuButton icon={Bell} label="Notificações" disabled />
            <MenuButton icon={CreditCard} label="Assinatura" disabled />
            <MenuButton icon={Mail} label="Contato" disabled />
            <MenuButton icon={HelpCircle} label="Ajuda" disabled />
          </div>
          
          <div className="mt-auto px-4 py-4">
            <Button variant="outline" className="w-full gap-2 text-sm border-gray-200 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all rounded-lg" onClick={handleSignOut}>
              <LogOut className="h-3.5 w-3.5" />
              Sair
            </Button>
            <p className="text-xs text-center text-gray-400 mt-3">Versão 1.0.0</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>;
}

interface MenuButtonProps {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

function MenuButton({
  icon: Icon,
  label,
  onClick,
  disabled
}: MenuButtonProps) {
  return <Button variant="ghost" className={`w-full justify-start px-4 py-3 h-auto text-sm rounded-lg transition-all
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-primary/10 hover:text-primary active:scale-98'}`} onClick={onClick} disabled={disabled}>
      <Icon className={`mr-3 h-5 w-5 ${disabled ? 'text-gray-400' : 'text-gray-500'}`} />
      <span className={disabled ? 'text-gray-400' : 'text-gray-700'}>{label}</span>
    </Button>;
}
