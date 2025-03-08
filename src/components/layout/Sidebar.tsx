import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Home, Inbox, CalendarClock, Bot, Brain, Target, Award, Settings, LogOut, Moon, Sun, ChevronRight, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/providers/UserProvider";
export function Sidebar() {
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState("Usuário");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const {
    user
  } = useUser();
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
  }, []);
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    navigate('/auth');
  };
  const handleEditProfile = () => {
    setOpen(false);
    navigate('/profileEdit');
  };
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Aqui você implementaria a lógica para alterar o tema
  };
  const menuItems = [{
    path: "/",
    label: "Início",
    icon: Home
  }, {
    path: "/today",
    label: "Inbox",
    icon: Inbox
  }, {
    path: "/planner",
    label: "Agenda",
    icon: CalendarClock
  }, {
    path: "/assistant",
    label: "Assistente",
    icon: Bot
  }, {
    path: "/mindfulness",
    label: "Mente",
    icon: Brain
  }, {
    path: "/achievements",
    label: "Conquistas",
    icon: Award
  }, {
    path: "/settings",
    label: "Configurações",
    icon: Settings
  }];
  if (location.pathname === "/auth") return null;
  return <>
      <Sheet open={open} onOpenChange={setOpen}>
        {/* Trigger invisível que será acionado programaticamente */}
        <SheetTrigger asChild>
          <div className="hidden sidebar-avatar-trigger">
            <span></span>
          </div>
        </SheetTrigger>
        
        <SheetContent side="left" className="p-0 w-full max-w-xs border-r-0 shadow-lg h-full flex flex-col bg-white">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="bg-violet-100 text-violet-800 text-lg">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-gray-800 text-lg font-bold">{userName}</h3>
                <Button variant="ghost" size="sm" onClick={handleEditProfile} className="px-0 py-0 h-auto text-xs text-purple-600 hover:text-purple-700 hover:bg-transparent">
                  Editar perfil <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
          
          <nav className="flex-grow overflow-y-auto mt-4 px-4">
            <div className="space-y-1 w-full">
              {menuItems.map(item => {
              const isActive = location.pathname === item.path;
              return <Link key={item.path} to={item.path} onClick={() => setOpen(false)}>
                    <Button variant={isActive ? "secondary" : "ghost"} className={`w-full justify-start px-4 py-3 h-auto text-sm rounded-xl ${isActive ? "bg-purple-100 text-purple-700 font-medium" : "text-gray-700 hover:bg-gray-100"}`}>
                      <item.icon className={`mr-3 h-5 w-5 ${isActive ? "text-purple-600" : "text-gray-500"}`} />
                      {item.label}
                    </Button>
                  </Link>;
            })}
            </div>
          </nav>
          
          <div className="mt-auto border-t border-gray-100 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 flex items-center">
                <Moon className="h-4 w-4 mr-2 text-gray-500" />
                Modo escuro
              </span>
              <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
            </div>
            
            <Button variant="outline" className="w-full gap-2 text-sm border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all rounded-xl" onClick={handleSignOut}>
              <LogOut className="h-3.5 w-3.5" />
              Sair
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>;
}
