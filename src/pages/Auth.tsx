
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/common/ThemeToggle";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
            },
          },
        });
        if (error) throw error;
        toast({
          title: "Cadastro realizado!",
          description: "Verifique seu email para confirmar o cadastro.",
        });
      } else {
        console.log("Tentando fazer login com:", email);
        
        // Usando o SDK do Supabase com timeout para melhor resiliência
        const loginPromise = new Promise<any>((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error("Timeout ao fazer login"));
          }, 20000); // 20 segundos de timeout
          
          supabase.auth.signInWithPassword({
            email,
            password,
          }).then(result => {
            clearTimeout(timeoutId);
            resolve(result);
          }).catch(err => {
            clearTimeout(timeoutId);
            reject(err);
          });
        });

        const { error } = await loginPromise;
        if (error) throw error;
        
        console.log("Login bem-sucedido, redirecionando...");
        toast({
          title: "Login realizado!",
          description: "Você será redirecionado em instantes.",
        });
        
        // Pequeno delay antes de redirecionar
        setTimeout(() => {
          navigate("/");
        }, 500);
      }
    } catch (error: any) {
      console.error("Erro de autenticação:", error);
      let errorMessage = error.message || "Erro desconhecido";
      
      // Tratamento específico para erros de conexão
      if (errorMessage.includes("fetch") || error.name === "TypeError") {
        errorMessage = "Erro de conexão com o servidor. Verifique sua internet e tente novamente.";
      } else if (errorMessage.includes("Invalid login credentials")) {
        errorMessage = "Email ou senha incorretos. Por favor, verifique suas credenciais.";
      }
      
      toast({
        variant: "destructive",
        title: "Erro no " + (isSignUp ? "cadastro" : "login"),
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#9b87f5] via-[#7E69AB] to-[#D6BCFA] flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-xs sm:max-w-sm bg-white rounded-[32px] p-5 sm:p-6 relative mx-auto">
        {isSignUp && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 rounded-full hover:bg-gray-100"
            onClick={() => setIsSignUp(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        <div className="text-center mb-5 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {isSignUp ? "Hello!" : "Welcome"}
          </h1>
          {!isSignUp && (
            <p className="text-gray-500 text-sm">
              Faça login para continuar
            </p>
          )}
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1">
              <Label htmlFor="username" className="text-sm text-gray-600">
                Nome de usuário
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required={isSignUp}
                className="h-10 border-gray-200 rounded-xl bg-gray-50/50"
              />
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="email" className="text-sm text-gray-600">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-10 border-gray-200 rounded-xl bg-gray-50/50"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password" className="text-sm text-gray-600">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-10 border-gray-200 rounded-xl bg-gray-50/50"
            />
          </div>

          <Button
            type="submit"
            className={`w-full h-10 text-sm font-semibold rounded-xl transition-transform hover:scale-[0.98] ${
              isSignUp 
                ? "bg-[#9b87f5] hover:bg-[#8a74f4] text-white" 
                : "bg-white hover:bg-gray-50 text-[#9b87f5] border-2 border-[#9b87f5]"
            }`}
            disabled={loading}
          >
            {loading
              ? "Carregando..."
              : isSignUp
              ? "Criar conta"
              : "Login"}
          </Button>

          {!isSignUp && (
            <div className="text-center mt-3">
              <Button
                type="button"
                variant="ghost"
                className="text-[#9b87f5] text-sm font-semibold hover:bg-[#9b87f5]/5"
                onClick={() => setIsSignUp(true)}
              >
                Sign up
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
