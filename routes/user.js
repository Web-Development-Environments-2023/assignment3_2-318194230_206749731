var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  // Check if a session exists and contains a username
  if (req.session && req.session.username) {
    DButils.execQuery("SELECT username FROM users")
      .then((users) => {
        // Check if the username exists in the users table
        if (users.find((x) => x.username === req.session.username)) {
          req.username = req.session.username;
          next();
        }
      })
      .catch((err) => next(err));
  } else {
    // Handle authentication errors
    if (!req.session) {
      console.log("Error: No session found");
    } else if (!req.session.username) {
      console.log("Error: No username found in session");
    }
    res.sendStatus(401);
  }
});

// Route: Add a recipe to the favorites list of the logged-in user
router.post('/favorites', async (req, res, next) => {
  try {
    const username = req.session.username;
    const recipe_id = req.body.recipeId;

    // Call the user_utils function to mark the recipe as a favorite for the user
    await user_utils.markAsFavorite(username, recipe_id);

    // Send a 200 response with a success message
    res.status(200).send("The Recipe successfully saved as favorite");
  } catch (error) {
    // Pass any error to the error handling middleware
    next(error);
  }
});


// Route: Retrieve the favorite recipes of the logged-in user
router.get('/favorites', async (req, res, next) => {
  try {
    const username = req.session.username;

    // Create an object to store the favorite recipes
    const favorite_recipes = {};

    // Retrieve the recipes IDs of the user's favorite recipes
    const recipes_id = await user_utils.getFavoriteRecipes(username);

    // Iterate over the recipes IDs and fetch their details using recipe_utils
    const results = [];
    for (const recipe of recipes_id) {
      const recipeDetails = await recipe_utils.getRecipeDet(recipe.recipe_id);
      results.push(recipeDetails);
    }

    // Send a 200 response with the array of favorite recipe details
    res.status(200).send(results);
  } catch (error) {
    // Pass any error to the error handling middleware
    next(error);
  }
});


// Route: Retrieve the recipes created by the logged-in user
router.get('/MyRecipes', async (req, res, next) => {
  try {
    const username = req.session.username;

    // Retrieve the recipe details created by the logged-in user using user_utils
    let results = await user_utils.getRecipeDetailsfromDBmyrecipes(username);

    // Send a 200 response with the array of recipe details
    res.status(200).send(results);
  } catch (error) {
    // Pass any error to the error handling middleware
    next(error);
  }
});

// Route: Add a recipe to the user's created recipes
router.post("/MyRecipes", async (req, res, next) => {
  try {
    const username = req.session.username;
    const recipeDetails = {
      recipe_id: req.body.recipe_id,
      title: req.body.title,
      image: req.body.image,
      readyInMinutes: req.body.readyInMinutes,
      popularity: req.body.popularity,
      vegetarian: req.body.vegetarian,
      vegan: req.body.vegan,
      glutenFree: req.body.glutenFree,
      extendedIngredients: req.body.extendedIngredients,
      instructions: req.body.instructions,
      servings: req.body.servings
    };

    // Call user_utils function to insert the recipe to the user's created recipes
    await user_utils.insertRecipeToMyRecipes(username, recipeDetails);

    // Send a 201 response with a success message
    res.status(201).send({ message: "Recipe created", success: true });
  } catch (error) {
    // Pass any error to the error handling middleware
    next(error);
  }
});

// Route: Retrieve the recipes shared within the user's family
router.get('/FamilyRecipes', async (req, res, next) => {
  try {
    const username = req.session.username;

    // Retrieve the recipe details shared within the user's family using user_utils
    let results = await user_utils.getRecipeDetailsfromDBfamilyrecipes(username);

    // Send a 200 response with the array of recipe details
    res.status(200).send(results);
  } catch (error) {
    // Pass any error to the error handling middleware
    next(error);
  }
});

// Route: Add a recipe to the user's created recipes
router.post("/FamilyRecipes", async (req, res, next) => {
  try {
    const username = req.session.username;
    const recipeDetails = {
      recipe_id: req.body.recipe_id,
      recipeName: req.body.recipeName,
      recipeOwner: req.body.recipeOwner,
      components: req.body.components,
      preparationMethod: req.body.preparationMethod,
      images: req.body.images,
      specialOccasions: req.body.specialOccasions,
      cookingTime: req.body.cookingTime,
      serves: req.body.serves
    };

    // Call user_utils function to insert the recipe to the user's family recipes
    await user_utils.insertRecipeTofamilyrecipes(username, recipeDetails);

    // Send a 201 response with a success message
    res.status(201).send({ message: "Recipe created", success: true });
  } catch (error) {
    // Pass any error to the error handling middleware
    next(error);
  }
});

// Route: Add a recipe to the user's last viewed recipes
router.post("/LastViewed", async (req, res, next) => {
  try {
    const username = req.session.username;
    const recipeId = req.body.recipe_id;

    // Call the checkAndInsertEntry function to check and insert an entry into the last seen recipes table
    await checkAndInsertEntry(username, recipeId);

    // Send a 201 response with a success message
    res.status(201).send({ message: "Recipe added", success: true });
  } catch (error) {
    // Send a 400 response with the error message
    res.status(400).send({ message: error.message, success: false });
  }
});

// Route: Retrieve the last viewed recipes of the logged-in user
router.get('/LastViewed', async (req, res, next) => {
  try {
    const username = req.session.username;

    // Call user_utils function to retrieve the last viewed recipes of the user
    let recipes = await user_utils.getRecipeDetailsfromDB3lastseenrecipes(username);
    const results = [];

    // Iterate over the retrieved recipes
    for (const recipe of recipes) {
      console.log(recipe);
      // Call recipe_utils function to get the detailed information of each recipe
      const recipeDetails = await recipe_utils.getRecipeDet(recipe.recipe_id);
      results.push(recipeDetails);
    }

    // Send a 200 response with the results array containing the detailed recipe information
    res.status(200).send(results);
  } catch (error) {
    // Pass any error to the error handling middleware
    next(error);
  }
});

// Helper function to check and insert an entry into the last seen recipes table
async function checkAndInsertEntry(username, recipeId) {
  // Check if an entry with the same username and recipe ID already exists
  const existingEntry = await DButils.execQuery(
    `SELECT * FROM 3lastseenrecipes WHERE username = '${username}' AND recipe_id = ${recipeId}`
  );

  if (existingEntry.length > 0) {
    // If an entry already exists, throw an error
    throw new Error("Entry already exists");
  }

  // Get the current time and format it
  const currentTime = new Date();
  const formattedTime = currentTime.toISOString().slice(0, 19).replace('T', ' ');

  // Insert a new entry into the last seen recipes table
  await DButils.execQuery(
    `INSERT INTO 3lastseenrecipes (username, recipe_id, date) VALUES ('${username}', ${recipeId}, '${formattedTime}')`
  );
}

module.exports = router;