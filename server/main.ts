import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT || 5005;

app.listen(PORT, () => {
  console.log(`🚀 BazaarBandhu API server running on port ${PORT}`);
});
