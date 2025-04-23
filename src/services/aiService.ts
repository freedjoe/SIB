import { supabase } from "@/integrations/supabase/client";

// Configuration pour l'API Google Gemini
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
const GEMINI_API_KEY = import.meta.env.VITE_GOOGLE_GEMINI_API;

// Types pour les messages et réponses
export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIResponse {
  content: string;
  error?: string;
}

// Fonction pour obtenir le contexte de l'utilisateur depuis la base de données
async function getUserContext(userId: string): Promise<string> {
  try {
    // Récupérer les informations de l'utilisateur
    const { data: userData, error: userError } = await supabase.from("users").select("username, role:role_id(name)").eq("id", userId).single();

    if (userError) throw userError;

    // Construire le contexte
    let context = `L'utilisateur est ${userData.username}`;
    if (userData.role) {
      context += ` avec le rôle ${userData.role.name}`;
    }

    return context;
  } catch (error) {
    console.error("Erreur lors de la récupération du contexte utilisateur:", error);
    return "Utilisateur du système";
  }
}

// Fonction principale pour obtenir une réponse de l'IA
export async function getAIResponse(userId: string, userMessage: string, conversationHistory: AIMessage[] = []): Promise<AIResponse> {
  try {
    // Vérifier si la clé API est configurée
    if (!GEMINI_API_KEY) {
      return {
        content: "Désolé, le service d'IA n'est pas configuré. Veuillez configurer la clé API Google Gemini.",
        error: "API key not configured",
      };
    }

    // Obtenir le contexte de l'utilisateur
    const userContext = await getUserContext(userId);

    // Préparer le prompt pour l'API Gemini
    let prompt = `Tu es un assistant IA utile pour un système de gestion budgétaire. 
    ${userContext}. 
    Tu peux répondre aux questions sur le budget, les programmes, les portefeuilles, les actions, les opérations, les engagements, les paiements, les rapports et l'audit.
    Réponds en français de manière concise et professionnelle.
    
    Historique de la conversation:
    `;

    // Ajouter l'historique de la conversation au prompt
    conversationHistory.forEach((msg) => {
      prompt += `${msg.role === "user" ? "Utilisateur" : "Assistant"}: ${msg.content}\n`;
    });

    // Ajouter la question actuelle
    prompt += `\nUtilisateur: ${userMessage}\nAssistant:`;

    // Appeler l'API Gemini
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur API Gemini: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();

    // Extraire la réponse du format Gemini
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Désolé, je n'ai pas pu générer une réponse.";

    return { content: aiResponse };
  } catch (error) {
    console.error("Erreur lors de l'appel à l'API Gemini:", error);
    return {
      content: "Désolé, je n'ai pas pu traiter votre demande pour le moment. Veuillez réessayer plus tard.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
