// 1. Import all necessary packages
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

// 2. Import your private Firebase key
const serviceAccount = require('./serviceAccountKey.json');

// 3. Initialize the Express app and Firebase Admin SDK
const app = express();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Get a reference to the Firestore database
const db = admin.firestore();

// 4. Set up Middleware
// This allows your front-end to make requests to this API
app.use(cors());

// 5. Define your first API endpoint (to get all recipes)
app.get('/recipes', async (req, res) => {
  try {
    // Get a reference to the 'recipes' collection
    const recipesRef = db.collection('recipes');
    // Get all documents from the collection
    const snapshot = await recipesRef.get();

    // If there are no recipes, return an empty array
    if (snapshot.empty) {
      res.json([]);
      return;
    }

    // Create an array to hold our recipes
    const recipes = [];
    // Loop through each document and format it
    snapshot.forEach(doc => {
      recipes.push({
        id: doc.id,          // The unique document ID
        ...doc.data()      // The rest of the recipe data (title, ingredients, etc.)
      });
    });

    // Send the array of recipes back as a JSON response
    res.json(recipes);

  } catch (error) {
    console.error("Error fetching recipes:", error);
    // Send a server error status code if something goes wrong
    res.status(500).send("Error fetching recipes from database.");
  }
});

// 6. Set the port and start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Try visiting http://localhost:${PORT}/recipes in your browser.`);
});