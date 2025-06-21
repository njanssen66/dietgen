import express, { Request, Response } from "express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

dotenv.config(); // Loads .env in local development

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY in environment variables.");
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

app.get("/", (req, res) => {
  res.send("Express on Vercel");
});

app.post('/api/generate', async (req: Request, res: Response) => {
  const userSettings = req.body;

  try {
    const functions = [
      {
        name: 'generate_meal',
        description: 'Generate a meal based on user settings',
        parameters: {
          type: 'object',
          properties: {
            meal: {
              type: 'object',
              description: 'A generated meal',
              properties: {
                name: { type: 'string', description: 'Name of the meal' },
                ingredients: { type: 'array', items: { type: 'string' }, description: 'List of ingredients' },
                instructions: { type: 'array', items: { type: 'string' }, description: 'Step-by-step instructions' },
                type: {
                  type: 'string',
                  description: 'Meal type',
                  enum: ['breakfast', 'lunch', 'dinner', 'snack']
                }
              },
              required: ['name', 'ingredients', 'instructions', 'type']
            }
          },
          required: ['meal'],
        },
      },
    ];

    const messages = [
      { role: 'system', content: 'You are a helpful meal generation assistant. Call generate_meal function to generate a meal.' },
      { role: 'user', content: `Generate a meal for: ${JSON.stringify(userSettings)}` },
    ];

    const completion = await openai.chat.completions.create({
      model: 'o4-mini',
      messages: messages as any,
      functions
    });

    const responseMessage = completion.choices[0].message;
    let meals: any = null;
    if (responseMessage.function_call && responseMessage.function_call.arguments) {
      try {
        meals = JSON.parse(responseMessage.function_call.arguments);
      } catch (e) {
        meals = responseMessage.function_call.arguments;
      }
    }

    res.json({ success: true, meals, userSettings });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default app;