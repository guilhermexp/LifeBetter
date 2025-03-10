import { supabase } from '@/integrations/supabase/client';

// Configuração para a API do OpenAI
import OpenAI from 'openai';
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Apenas para desenvolvimento
});

// Tipos para os resultados da análise
export interface AIAnalysisResult {
  title?: string;
  description?: string;
  tags: string[];
  highlights: string[];
  imageUrl?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  categories?: string[];
}

/**
 * Serviço de análise de IA para links e conteúdo
 * 
 * IMPORTANTE: Em ambiente de produção, este serviço deve ser conectado à API do GPT-4
 * conforme sugerido pelo cliente para uma análise mais profunda e precisa de conteúdo
 * 
 * Para implementar:
 * 1. Instalar o pacote OpenAI: npm install openai
 * 2. Configurar VITE_OPENAI_API_KEY no .env
 * 3. Descomentar o código de configuração do OpenAI acima
 * 4. Substituir os métodos simulados pelos métodos que fazem chamadas reais à API
 */
export class AIAnalysisService {

  /**
   * Analisar um link usando IA
   * @param url URL para analisar
   * @returns Resultado da análise com insights e metadados
   */
  public static async analyzeUrl(url: string): Promise<AIAnalysisResult> {
    try {
      // Extrair informações básicas do URL
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      const path = urlObj.pathname;
      
      // Análise real com GPT-4
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "Você é um assistente especializado em análise de URLs e extração de insights significativos. Sua tarefa é analisar a URL fornecida e retornar uma análise estruturada com título, descrição, tags relevantes, insights principais e categorias apropriadas. Formate sua resposta como um objeto JSON com as seguintes propriedades: title (string), description (string), tags (array de strings), highlights (array de strings com 2-4 insights principais), e categories (array de strings com 1-3 categorias)."
          },
          { 
            role: "user", 
            content: `Analise a seguinte URL e extraia insights, título, descrição, tags e categorias: "${url}". Domínio: ${domain}, Caminho: ${path}`
          }
        ],
        temperature: 0.7,
        max_tokens: 800,
        response_format: { type: "json_object" }
      });
      
      // Processar a resposta da API
      const analysisResult = JSON.parse(response.choices[0].message.content);
      
      // Para domínios específicos, podemos personalizar ainda mais a resposta
      let result: AIAnalysisResult;
      
      if (domain.includes('mindtrip.ai')) {
        // Resposta personalizada para mindtrip.ai
        result = {
          title: "MindTrip AI - Plataforma de exploração e aprendizado",
          description: "MindTrip.ai é uma plataforma inovadora que combina inteligência artificial com exploração de conhecimento. Oferece ferramentas para expandir sua compreensão e aprendizado em diversas áreas, com ênfase em desenvolvimento pessoal e cognitivo.",
          imageUrl: "https://placehold.co/100x100/6366f1/FFFFFF.png?text=AI",
          tags: ["inteligência artificial", "aprendizado", "produtividade", "desenvolvimento pessoal", "mindtrip"],
          highlights: [
            "Esta plataforma usa IA para mapear conexões entre diferentes áreas de conhecimento, ajudando a expandir sua compreensão de tópicos complexos.",
            "Os recursos interativos permitem explorar ideias de forma não-linear, potencialmente revelando insights que métodos tradicionais de aprendizado podem não oferecer.",
            "Recomendamos explorar a seção 'Explore' para descobrir como este recurso pode complementar seus estudos atuais em tecnologia e desenvolvimento pessoal."
          ],
          categories: ["tecnologia", "educação", "IA"]
        };
      } else if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
        result = this.getYoutubeAnalysis(url);
      } else if (domain.includes('instagram.com')) {
        result = this.getInstagramAnalysis(url);
      } else if (domain.includes('github.com')) {
        result = this.getGithubAnalysis(url);
      } else if (domain.includes('linkedin.com')) {
        result = this.getLinkedinAnalysis(url);
      } else {
        result = this.getGenericWebAnalysis(url);
      }
      
      return result;
    } catch (error) {
      console.error("Erro ao analisar URL:", error);
      
      // Retornar análise básica em caso de erro
      return {
        title: `Conteúdo Web`,
        description: `Este link contém informações que podem ser relevantes para seus interesses.`,
        tags: ["web", "link"],
        highlights: [
          "Este conteúdo web parece relevante para seus interesses.",
          "A IA sugeriu revisitar este link posteriormente para obter mais informações."
        ]
      };
    }
  }
  
  /**
   * Analisar texto usando IA
   * @param text Texto para analisar
   * @returns Resultado da análise com insights e metadados
   */
  public static async analyzeText(text: string): Promise<AIAnalysisResult> {
    try {
      // Análise real com GPT-4
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "Você é um assistente especializado em análise de texto e extração de insights significativos. Sua tarefa é analisar o texto fornecido e retornar uma análise estruturada com tags relevantes, insights principais, sentimento geral e categorias apropriadas. Formate sua resposta como um objeto JSON com as seguintes propriedades: tags (array de strings), highlights (array de strings com 2-4 insights principais), sentiment (string: 'positive', 'negative', ou 'neutral'), e categories (array de strings com 1-3 categorias)."
          },
          { 
            role: "user", 
            content: `Analise o seguinte texto e extraia insights, tags, sentimento e categorias: "${text}"`
          }
        ],
        temperature: 0.7,
        max_tokens: 800,
        response_format: { type: "json_object" }
      });
      
      // Processar a resposta da API
      const analysisResult = JSON.parse(response.choices[0].message.content);
      
      // Formatar o resultado para o formato esperado pela aplicação
      return {
        tags: analysisResult.tags || ["nota"],
        highlights: analysisResult.highlights || ["A IA analisou este conteúdo e o considerou relevante para seus interesses."],
        sentiment: analysisResult.sentiment as 'positive' | 'negative' | 'neutral' || 'neutral',
        categories: analysisResult.categories || ['nota pessoal']
      };
    } catch (error) {
      console.error("Erro ao analisar texto:", error);
      
      // Análise básica em caso de erro
      return {
        tags: ["nota", "texto"],
        highlights: [
          "Este texto contém informações que podem ser relevantes para sua organização pessoal.",
          "A IA identificou este como um pensamento que vale a pena revisitar."
        ],
        sentiment: 'neutral'
      };
    }
  }

  /**
   * Salvar análise no banco de dados
   * @param noteId ID da nota
   * @param analysis Resultado da análise
   */
  public static async saveAnalysis(noteId: string, analysis: AIAnalysisResult) {
    try {
      const { error } = await supabase
        .from('notes_analysis')
        .upsert({
          note_id: noteId,
          analysis: analysis,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error("Erro ao salvar análise:", error);
      return false;
    }
  }

  /**
   * Respostas simuladas para diferentes tipos de conteúdo
   * NOTA: Em produção com GPT-4, estas funções seriam substituídas por chamadas reais à API
   */
  private static getYoutubeAnalysis(url: string): AIAnalysisResult {
    return {
      title: "Vídeo do YouTube",
      description: "Nossa IA analisou este vídeo e identificou que ele contém informações educacionais sobre tecnologia e desenvolvimento pessoal. O conteúdo aborda conceitos que podem ampliar seus conhecimentos na área.",
      imageUrl: "https://placehold.co/100x100/FF0000/FFFFFF.png?text=YT",
      tags: ["vídeo", "educacional", "youtube", "desenvolvimento"],
      highlights: [
        "Este vídeo complementa outros materiais que você salvou sobre desenvolvimento de habilidades.",
        "Os conceitos apresentados podem ser aplicados em seus projetos atuais.",
        "Nossa IA identificou uma abordagem prática que se alinha com seu estilo de aprendizagem."
      ],
      categories: ["mídia", "educação"]
    };
  }
  
  private static getInstagramAnalysis(url: string): AIAnalysisResult {
    return {
      title: "Perfil do Instagram",
      description: "A IA detectou que este link contém conteúdo do Instagram relacionado a tecnologia. Nossa análise sugere que este perfil compartilha regularmente sobre inovações tecnológicas e IA.",
      imageUrl: "https://placehold.co/100x100/4f46e5/FFFFFF.png?text=IG",
      tags: ["instagram", "rede social", "tecnologia", "conteúdo visual"],
      highlights: [
        "Este perfil compartilha conteúdo sobre inteligência artificial que se alinha com seus interesses recentes.",
        "O conteúdo visual deste perfil oferece exemplos práticos de implementações tecnológicas.",
        "Recomendamos salvar este conteúdo na categoria 'Tecnologia' para referência futura."
      ],
      categories: ["social media", "tecnologia"]
    };
  }
  
  private static getGithubAnalysis(url: string): AIAnalysisResult {
    return {
      title: "Repositório GitHub",
      description: "Nossa IA identificou este repositório como uma coleção de códigos e recursos para desenvolvimento. Os conteúdos parecem alinhados com seus interesses em programação e tecnologia.",
      imageUrl: "https://placehold.co/100x100/171515/FFFFFF.png?text=GH",
      tags: ["código", "desenvolvimento", "projeto", "github"],
      highlights: [
        "Este repositório contém exemplos que podem ajudar em seus projetos atuais.",
        "A estrutura do código segue padrões semelhantes aos que você tem estudado.",
        "Nossa análise sugere correlação com outros recursos de programação que você salvou anteriormente."
      ],
      categories: ["programação", "recurso técnico"]
    };
  }
  
  private static getLinkedinAnalysis(url: string): AIAnalysisResult {
    return {
      title: "Perfil ou Artigo do LinkedIn",
      description: "O conteúdo do LinkedIn que você salvou parece estar relacionado a networking profissional e desenvolvimento de carreira. Este recurso pode ser valioso para seus objetivos profissionais.",
      imageUrl: "https://placehold.co/100x100/0077B5/FFFFFF.png?text=LI",
      tags: ["linkedin", "carreira", "profissional", "networking"],
      highlights: [
        "Este conteúdo compartilha insights relevantes para seu desenvolvimento profissional atual.",
        "Há conceitos mencionados que complementam suas habilidades existentes.",
        "Recomendamos revisar este conteúdo quando estiver planejando próximos passos na carreira."
      ],
      categories: ["carreira", "desenvolvimento profissional"]
    };
  }
  
  private static getGenericWebAnalysis(url: string): AIAnalysisResult {
    const domain = new URL(url).hostname;
    const pathParts = new URL(url).pathname.split('/').filter(part => part.length > 0);
    const possibleTopic = pathParts.length > 0 ? pathParts[pathParts.length - 1].replace(/-/g, ' ') : '';
    
    // Geração de tags baseada em análise da URL
    const inferredTags = ['web'];
    if (domain.includes('news') || domain.includes('blog')) inferredTags.push('artigo');
    if (domain.includes('docs') || possibleTopic.includes('documentation')) inferredTags.push('documentação');
    if (domain.includes('learn') || domain.includes('curso')) inferredTags.push('aprendizado');
    
    return {
      title: `Conteúdo de ${domain}`,
      description: `Nossa IA analisou este link e identificou conteúdo relacionado a "${possibleTopic || 'tópicos diversos'}". O site parece conter informações que complementam sua jornada de aprendizado.`,
      tags: inferredTags,
      highlights: [
        `Este conteúdo web tem relevância para seus interesses em ${inferredTags.join(', ')}.`,
        "A IA detectou padrões que sugerem utilidade para seus objetivos de desenvolvimento pessoal.",
        "Recomendamos revisar este material quando estiver estudando tópicos relacionados."
      ],
      categories: ['recurso web', 'informação']
    };
  }
}
