import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function generateQuestions(content: string, numberOfQuestions: number = 5) {
  try {
    const prompt = `Génère ${numberOfQuestions} questions à choix multiples basées sur le contenu suivant. Pour chaque question, fournis 4 options dont une seule est correcte. Format JSON attendu:
    {
      "questions": [
        {
          "question": "...",
          "correct_answer": "...",
          "options": ["...", "...", "...", "..."]
        }
      ]
    }
    
    Contenu: ${content}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const result = JSON.parse(response.choices[0].message.content || "");
    return result.questions;
  } catch (error) {
    console.error('Erreur lors de la génération des questions:', error);
    throw error;
  }
}