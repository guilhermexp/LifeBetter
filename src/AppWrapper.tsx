
import { useEffect } from "react";
import App from "./App";
import { Routes, Route } from "react-router-dom";
import ProfileEdit from "./pages/ProfileEdit";
import { ensureProfileImagesBucketExists } from "./integrations/supabase/storage";

const AppWrapper = () => {
  useEffect(() => {
    // Tentamos garantir que o bucket de imagens de perfil exista
    ensureProfileImagesBucketExists();
  }, []);

  return (
    <>
      <Routes>
        <Route path="/profileEdit" element={<ProfileEdit />} />
        <Route path="*" element={<App />} />
      </Routes>
    </>
  );
};

export default AppWrapper;
