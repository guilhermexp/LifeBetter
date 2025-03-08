
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useUserProfile() {
  const [userName, setUserName] = useState("Usuário");

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('username, full_name')
          .eq('id', user.id)
          .maybeSingle();
          
        if (data) {
          setUserName(data.full_name || data.username || "Usuário");
        } else {
          setUserName(user.email?.split('@')[0] || "Usuário");
        }
      }
    } catch (error) {
      console.error("Erro ao buscar perfil do usuário:", error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return { userName, setUserName, fetchUserProfile };
}
