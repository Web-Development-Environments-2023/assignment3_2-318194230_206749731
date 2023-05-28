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
    await user_utils.markAsFavorite(username, recipe_id);
    res.status(200).send("The Recipe successfully saved as favorite");
  } catch (error) {
    next(error);
  }
});

// Route: Retrieve the favorite recipes of the logged-in user
router.get('/favorites', async (req, res, next) => {
  try {
    const username = req.session.username;
    
    const favorite_recipes = {};
    const recipes_id = await user_utils.getFavoriteRecipes(username);
    const results = [];

    for (const recipe of recipes_id) {
      const recipeDetails = await recipe_utils.getRecipeDetails(recipe.recipe_id);
      results.push(recipeDetails);
    }

    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
});

// Route: Retrieve the recipes created by the logged-in user
router.get('/MyRecipes', async (req, res, next) => {
  try {

    const username = req.session.username;
    let results = await user_utils.getRecipeDetailsfromDBmyrecipes(username);
    res.status(200).send(results);
  } catch (error) {
    
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
      IngredientsAndAmount: req.body.IngredientsAndAmount,
      instructions: req.body.instructions,
      servings: req.body.servings

    };

    await user_utils.insertRecipeToMyRecipes(username, recipeDetails);

    res.status(201).send({ message: "Recipe created", success: true });
  } catch (error) {
    next(error);
  }
});

// Route: Retrieve the recipes shared within the user's family
router.get('/FamilyRecipes', async (req, res, next) => {
  try {

    const username = req.session.username;
    let results = await user_utils.getRecipeDetailsfromDBfamilyrecipes(username);
    res.status(200).send(results);
  } catch (error) {

    next(error);
  }
});

// Route: Add a recipe to the user's last viewed recipes
router.post("/LastViewed", async (req, res, next) => {
  try {
    const username = req.session.username;
    const recipeId = req.body.recipe_id;


    await checkAndInsertEntry(username, recipeId);

    res.status(201).send({ message: "Recipe added", success: true });
  } catch (error) {
    res.status(400).send({ message: error.message, success: false });
  }
});

// Route: Retrieve the last viewed recipes of the logged-in user
router.get('/LastViewed', async (req, res, next) => {
  try {

    const username = req.session.username;
    let recipes = await user_utils.getRecipeDetailsfromDB3lastseenrecipes(username);
    const results = [];

    for (const recipe of recipes) {
      const recipeDetails = await recipe_utils.getRecipeDetails(recipe.recipe_id);
      results.push(recipeDetails);
    }

    res.status(200).send(results);
  } catch (error) {

    next(error);
  }
});


// Helper function to check and insert an entry into the last seen recipes table
async function checkAndInsertEntry(username, recipeId) {

  const existingEntry = await DButils.execQuery(
    `SELECT * FROM 3lastseenrecipes WHERE username = '${username}' AND recipe_id = ${recipeId}`
  );

  if (existingEntry.length > 0) {

    throw new Error("Entry already exists");
  }


  const currentTime = new Date();
  const formattedTime = currentTime.toISOString().slice(0, 19).replace('T', ' ');

  await DButils.execQuery(
    `INSERT INTO 3lastseenrecipes (username, recipe_id, date) VALUES ('${username}', ${recipeId}, '${formattedTime}')`
  );
}

module.exports = router;
