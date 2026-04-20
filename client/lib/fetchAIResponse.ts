export const fetchAIResponse = async (text: string, selectedLanguage: string, context?: any): Promise<string> => {
  const res = await fetch("/api/ai-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      message: text, 
      language: selectedLanguage,
      context: context
    }),
  });
  const data = await res.json();
  console.log("AI API response:", data);
  return data.reply || "माफ़ कीजिए, मैं इस समय जवाब नहीं दे पा रहा हूं।";
};
