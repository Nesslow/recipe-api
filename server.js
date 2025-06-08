// 1. Import all necessary packages
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

// 2. Import your private Firebase key
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : require('./serviceAccountKey.json');


// 3. Initialize the Express app and Firebase Admin SDK
const app = express();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 4. Set up Middleware (Corrected and Simplified)
// This single line, placed before your routes, handles all CORS logic including pre-flight.
app.use(cors()); 
// This middleware is for reading the JSON body of POST requests.
app.use(express.json());


// 5. Define your API endpoints
app.get('/recipes', async (req, res) => {
  try {
    const recipesRef = db.collection('recipes');
    const snapshot = await recipesRef.get();
    if (snapshot.empty) {
      res.json([]);
      return;
    }
    const recipes = [];
    snapshot.forEach(doc => {
      recipes.push({
        id: doc.id,
        ...doc.data()
      });
    });
    res.json(recipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).send("Error fetching recipes from database.");
  }
});

app.get('/recipes/:id', async (req, res) => {
    try {
      const recipeId = req.params.id;
      const recipeRef = db.collection('recipes').doc(recipeId);
      const doc = await recipeRef.get();
      if (!doc.exists) {
        res.status(404).send('Recipe not found');
      } else {
        res.json({ id: doc.id, ...doc.data() });
      }
    } catch (error) {
      console.error("Error fetching single recipe:", error);
      res.status(500).send("Error fetching recipe from database.");
    }
  });

app.post('/recipes', async (req, res) => {
    try {
      const newRecipe = req.body;
      if (!newRecipe.title || !newRecipe.ingredients || !newRecipe.instructions) {
        return res.status(400).send({ message: 'Missing required fields: title, ingredients, or instructions.' });
      }
      const docRef = await db.collection('recipes').add(newRecipe);
      res.status(201).send({ message: `Recipe created successfully with ID: ${docRef.id}` });
    } catch (error) {
      console.error("Error creating recipe:", error);
      res.status(500).send({ message: "Error creating recipe in database." });
    }
  });


// 6. Set the port and start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});