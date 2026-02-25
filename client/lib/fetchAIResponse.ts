export const fetchAIResponse = async (text: string, selectedLanguage: string): Promise<string> => {
  const res = await fetch("/api/ai-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text, language: selectedLanguage }),
  });
  const data = await res.json();
  console.log("AI API response:", data);
  return data.reply || "माफ़ कीजिए, मैं इस समय जवाब नहीं दे पा रहा हूं।";
};
