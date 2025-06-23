import express, { Request, Response } from "express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";
import { put } from '@vercel/blob';

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
  const userSettings = req.body.userSettings;
  const mealType = req.body.mealType;
  const existingMeals = req.body.existingMeals;
  const message = req.body.message;

  try {
    const functions = [
      {
        name: 'generate_meal',
        description: 'Generate a meal for the user.',
        parameters: {
          type: 'object',
          properties: {
            meal: {
              type: 'object',
              description: 'A generated meal for the user.',
              properties: {
                name: { type: 'string', description: 'Name of the meal' },
                ingredients: { type: 'array', items: { type: 'string' }, description: 'List of ingredients' },
                instructions: { type: 'array', items: { type: 'string' }, description: 'Step-by-step instructions' },
                mealType: { type: 'string', description: 'The type of meal (breakfast, lunch, or dinner)', enum: ['breakfast', 'lunch', 'dinner'] }
              },
              required: ['name', 'ingredients', 'instructions', 'mealType']
            }
          },
          required: ['meal'],
        },
      },
    ];

    var systemMessage = { 
      role: 'system', content: 'You are a helpful meal generation assistant. ' + 
      'Call generate_meal function to generate a meal. You should create meals ' +
      'with multiple ingredients. If a user asks just to change amount of an ' +
      'ingredient, use discretion to change the amount of the other ingredients if needed. '
    };

    if (existingMeals.length > 0) {
      systemMessage.content += `The user already has the following meals: ${JSON.stringify(existingMeals)}`;
    }

    const userMessage = { role: 'user', content: message ?? `Generate a ${mealType} meal for: ${JSON.stringify(userSettings)}` }

    const messages = [ systemMessage, userMessage ]

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

    res.json({ success: true, meals });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/generate-image', async (req: Request, res: Response) => {
  const { name, ingredients } = req.body;

  try {
    // Compose a prompt for the image generation
    const prompt = `A beautiful, appetizing photo of a meal called "${name}" made with the following ingredients: ${ingredients.join(', ')}. Plated and styled for a recipe website.`;

    // Use OpenAI's image generation API (DALL·E 3)
    const imageResponse = await openai.images.generate({
      model: 'gpt-image-1',
      prompt,
      quality: 'low',
      size: '1024x1024',
    });

    const image_base64 = imageResponse.data?.[0]?.b64_json;
    if (!image_base64) {
      throw new Error('No image base64 returned from OpenAI.');
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(image_base64, 'base64');
    
    // Generate a unique filename
    const timestamp = Date.now();
    const filename = `meal-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${timestamp}.png`;
    
    // Upload to Vercel Blob storage
    const blob = await put(filename, imageBuffer, {
      access: 'public',
      contentType: 'image/png'
    });

    res.json({ 
      image: blob.url,
    });
  } catch (error: any) {
    console.error('Error generating meal image:', error);
    res.status(500).json({ error: error.message || 'Failed to generate image.' });
  }
});

export default app;