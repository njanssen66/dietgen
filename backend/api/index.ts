import express from "express";
import cors from "cors";

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Express on Vercel");
});

app.post("/api/generate", (req, res) => {
  // Extract user settings from request body
  const userSettings = req.body;
  
  // Generate fake meal data based on user settings
  const fakeMeals = generateFakeMeals(userSettings);
  
  res.json({
    success: true,
    meals: fakeMeals,
    userSettings: userSettings
  });
});

function generateFakeMeals(userSettings) {
  const meals = [
    {
      id: 1,
      name: "Grilled Chicken Salad",
      type: "lunch",
      ingredients: [
        "Grilled chicken breast (150g)",
        "Mixed greens (2 cups)",
        "Cherry tomatoes (1/2 cup)",
        "Cucumber (1/2 cup)",
        "Olive oil (1 tbsp)",
        "Balsamic vinegar (1 tbsp)"
      ],
      instructions: [
        "Season chicken breast with salt and pepper",
        "Grill for 6-8 minutes per side until cooked through",
        "Chop vegetables and mix in a bowl",
        "Slice chicken and add to salad",
        "Drizzle with olive oil and balsamic vinegar"
      ]
    },
    {
      id: 2,
      name: "Oatmeal with Berries",
      type: "breakfast",
      ingredients: [
        "Rolled oats (1/2 cup)",
        "Almond milk (1 cup)",
        "Mixed berries (1/2 cup)",
        "Honey (1 tbsp)",
        "Chia seeds (1 tbsp)"
      ],
      instructions: [
        "Cook oats with almond milk for 5 minutes",
        "Top with fresh berries",
        "Drizzle with honey",
        "Sprinkle chia seeds on top"
      ]
    },
    {
      id: 3,
      name: "Salmon with Quinoa",
      type: "dinner",
      ingredients: [
        "Salmon fillet (150g)",
        "Quinoa (1/2 cup cooked)",
        "Broccoli (1 cup)",
        "Lemon (1/2)",
        "Olive oil (1 tbsp)",
        "Garlic (2 cloves)"
      ],
      instructions: [
        "Season salmon with salt, pepper, and lemon",
        "Bake at 400°F for 12-15 minutes",
        "Cook quinoa according to package instructions",
        "Steam broccoli until tender",
        "Serve salmon over quinoa with broccoli"
      ]
    },
    {
      id: 4,
      name: "Greek Yogurt with Nuts",
      type: "snack",
      ingredients: [
        "Greek yogurt (1 cup)",
        "Mixed nuts (1/4 cup)",
        "Honey (1 tsp)"
      ],
      instructions: [
        "Scoop Greek yogurt into a bowl",
        "Top with mixed nuts",
        "Drizzle with honey"
      ]
    }
  ];


  return meals;
}

app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;