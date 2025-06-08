// 1. Import all necessary packages
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

// --- START DEBUGGING BLOCK ---
// This code will run the instant the server starts on Render.
console.log("--- Recipe API Server Starting Up ---");
console.log("Checking for environment variable 'FIREBASE_SERVICE_ACCOUNT'...");

const serviceAccountJSON = process.env.FIREBASE_SERVICE_ACCOUNT;

if (serviceAccountJSON) {
    console.log("SUCCESS: Environment variable was FOUND.");
    // We'll log the first 40 characters to confirm it's not empty, without exposing the private key.
    console.log("Variable preview:", serviceAccountJSON.substring(0, 40));
} else {
    console.error("FATAL ERROR: Environment variable 'FIREBASE_SERVICE_ACCOUNT' was NOT FOUND.");
    console.error("This is why the application is crashing. Please double-check the 'Environment' tab for your service on Render.com.");
    // If the key is missing in a production environment, we stop the app immediately.
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
}
// --- END DEBUGGING BLOCK ---


// 2. Import your private Firebase key using the logic from above
const serviceAccount = serviceAccountJSON
  ? JSON.parse(serviceAccountJSON)
  : require('./serviceAccountKey.json');


// 3. Initialize the Express app and Firebase Admin SDK
const app = express();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Get a reference to the Firestore database
const db = admin.firestore();

// 4. Set up Middleware
app.use(cors());

// 5. Define your API endpoint
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

// 6. Set the port and start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Try visiting http://localhost:${PORT}/recipes in your browser.`);
});