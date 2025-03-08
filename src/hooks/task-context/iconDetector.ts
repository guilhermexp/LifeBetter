
import { 
  ShowerHead, Bath, Utensils, Coffee, 
  Book, Monitor, Music, Bed, Dumbbell, 
  Phone, Mail, MessageSquare, Camera, 
  Video, ShoppingCart, Trash, CalendarDays,
  Clock, Brush, Brain, Bus, Car, Plane,
  Umbrella, Sun, Cloud, School, Briefcase,
  PenTool, Pencil, GitCommit, Wallet, CreditCard,
  Home, MapPin, Sparkles, Film, Tv, Baby,
  Bike, Scissors, Flower, Pizza, Soup, Salad,
  Drumstick, Music2, Smile, Heart, GraduationCap,
  LucideIcon, ListChecks
} from "lucide-react";

type IconKeywordMap = {
  [keyword: string]: LucideIcon;
};

/**
 * Map of keywords to icons
 * The order matters - more specific matches should come first
 */
const iconKeywordMap: IconKeywordMap = {
  // Higiene pessoal
  "banho": ShowerHead,
  "chuveiro": ShowerHead,
  "tomar banho": ShowerHead,
  "ducha": ShowerHead,
  "banheira": Bath,
  "escovar dente": Brush,
  "escovar os dente": Brush,
  "escova": Brush,

  // Alimentação
  "comer": Utensils,
  "almoço": Utensils,
  "almoçar": Utensils,
  "jantar": Utensils,
  "café da manhã": Coffee,
  "café": Coffee,
  "lanche": Utensils,
  "pizza": Pizza,
  "sopa": Soup,
  "salada": Salad,
  "frango": Drumstick,

  // Atividades intelectuais
  "ler": Book,
  "leitura": Book,
  "livro": Book,
  "estudar": Book,
  "estudo": Book,
  "computador": Monitor,
  "programar": Monitor,
  "codigo": Monitor,
  "pensar": Brain,
  "reunião": Briefcase,
  "reuniao": Briefcase,
  "encontro": Briefcase,
  "aula": School,
  "curso": School,
  "faculdade": GraduationCap,
  "universidade": GraduationCap,
  "escola": School,
  "educação": School,
  "ensino": School,
  "pesquisa": PenTool,
  "escrever": Pencil,
  "anotar": Pencil,

  // Lazer
  "música": Music,
  "musica": Music,
  "tocar": Music2,
  "cantar": Music2,
  "dormir": Bed,
  "descansar": Bed,
  "deitar": Bed,
  "exercício": Dumbbell,
  "exercicio": Dumbbell,
  "academia": Dumbbell,
  "malhar": Dumbbell,
  "treinar": Dumbbell,
  "treino": Dumbbell,
  "correr": Dumbbell,
  "andar": Dumbbell,
  "caminhada": Dumbbell,
  "bicicleta": Bike,
  "pedalar": Bike,
  "filme": Film,
  "cinema": Film,
  "assistir": Tv,
  "série": Tv,
  "serie": Tv,
  "cuidar do bebe": Baby,
  "filho": Baby,
  "criança": Baby,
  "cortar cabelo": Scissors,
  "jardim": Flower,
  "plantas": Flower,
  "diversão": Sparkles,
  "festa": Sparkles,
  "celebração": Sparkles,
  "aniversário": Cake,

  // Comunicação
  "telefonar": Phone,
  "ligar": Phone,
  "telefonema": Phone,
  "ligação": Phone,
  "email": Mail,
  "e-mail": Mail,
  "correio": Mail,
  "mensagem": MessageSquare,
  "whatsapp": MessageSquare,
  "telegram": MessageSquare,
  "foto": Camera,
  "fotografia": Camera,
  "fotografar": Camera,
  "vídeo": Video,
  "video": Video,
  "gravar": Video,

  // Tarefas domésticas
  "compras": ShoppingCart,
  "comprar": ShoppingCart,
  "mercado": ShoppingCart,
  "supermercado": ShoppingCart,
  "shopping": ShoppingCart,
  "lixo": Trash,
  "limpar": Sparkles,
  "faxina": Sparkles,
  "lavar": Sparkles,
  "passar": Sparkles,
  "casa": Home,
  "apartamento": Home,
  "decorar": Home,
  "arrumacao": Home,

  // Transporte
  "ônibus": Bus,
  "onibus": Bus,
  "carro": Car,
  "dirigir": Car,
  "viagem": Plane,
  "viajar": Plane,
  "avião": Plane,
  "aviao": Plane,
  "trem": Bus,
  "metrô": Bus,
  "metro": Bus,

  // Clima
  "chuva": Umbrella,
  "guarda-chuva": Umbrella,
  "sol": Sun,
  "praia": Sun,
  "nuvem": Cloud,
  
  // Finanças
  "pagar": Wallet,
  "pagamento": Wallet,
  "conta": Wallet,
  "banco": CreditCard,
  "dinheiro": Wallet,
  "financeiro": CreditCard,
  
  // Outros
  "encontrar": MapPin,
  "local": MapPin,
  "lugar": MapPin,
  "localização": MapPin,
  "localizacao": MapPin,
  "mapa": MapPin,
  "sorrir": Smile,
  "alegria": Smile,
  "feliz": Smile,
  "amor": Heart,
  "namorado": Heart,
  "namorada": Heart,
  "amar": Heart,
  "compromisso": GitCommit,
};

// Adicione esta importação  
import { Cake } from "lucide-react";

/**
 * Detecta o melhor ícone para o texto da tarefa
 */
export const detectTaskIcon = (text: string): LucideIcon => {
  if (!text) return ListChecks;
  
  // Converte para minúsculas para tornar a correspondência insensível a caso
  const lowerText = text.toLowerCase();
  
  // Procura correspondências na lista de palavras-chave
  for (const [keyword, icon] of Object.entries(iconKeywordMap)) {
    if (lowerText.includes(keyword)) {
      return icon;
    }
  }
  
  // Se não encontrar correspondência, retorna o ícone padrão de tarefa
  return ListChecks;
};
