import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

// POST /api/generate - placeholder implementation
app.post('/api/generate', (req, res) => {
  const { userSettings, chatInput } = req.body;
  // TODO: Integrate with LLM provider
  res.json({
    message: 'LLM response placeholder',
    received: { userSettings, chatInput }
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
}); 