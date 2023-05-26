var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) 
{
  
  if (req.session && req.session.username) {
    DButils.execQuery("SELECT username FROM users")
      .then((users) => {
        if (users.find((x) => x.username === req.session.username)) {
          req.username = req.session.username;
          next();
        }
      })
      .catch((err) => next(err));
  } else {
    if (!req.session) {
      console.log("Error: No session found");
    } else if (!req.session.username) {187
      console.log("Error: No username found in session");
    }
    res.sendStatus(401);
  }
});


/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post('/favorites', async (req,res,next) => {
  try{
    const username = req.session.username;
    const recipe_id = req.body.recipeId;
    console.log(recipe_id);
    await user_utils.markAsFavorite(username,recipe_id);
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
    next(error);
  }
})

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/favorites', async (req, res, next) => {
  try {
    const username = req.session.username;
    console.log("this when i do get request   : " + username);
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


//The next code has Get and Post http request 

router.get('/MyRecipes', async (req, res, next) => {
  try {
    // Get the user ID from the session
    const username = req.session.username;
    let results = await  user_utils.getRecipeDetailsfromDBmyrecipes(username);
    // Send the results as the response with a status code of 200 (OK)
    res.status(200).send(results);
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
});

router.post("/MyRecipes", async (req, res, next) => {
  try {
    const username = req.session.username;
    let recipe_details = {
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

    // Check if the recipe ID already exists in the "myrecipes" table
    const existingRecipe = await DButils.execQuery(
      `SELECT recipe_id FROM myrecipes WHERE recipe_id = ${recipe_details.recipe_id}`
    );
    if (existingRecipe.length > 0) {
      throw new Error("Recipe ID already exists.");
    }

    // Insert the new recipe into the "myrecipes" table
    await DButils.execQuery(
      `INSERT INTO myrecipes (username, recipe_id, title, image, readyInMinutes, popularity, vegetarian, vegan, glutenFree, IngredientsAndAmount, instructions, servings)
       VALUES ('${username}', ${recipe_details.recipe_id}, '${recipe_details.title}', '${recipe_details.image}', ${recipe_details.readyInMinutes}, ${recipe_details.popularity},
               ${recipe_details.vegetarian}, ${recipe_details.vegan}, ${recipe_details.glutenFree}, '${JSON.stringify(recipe_details.IngredientsAndAmount)}',
               '${recipe_details.instructions.replace(/'/g, "''")}', ${recipe_details.servings})`
    );
    

    res.status(201).send({ message: "Recipe created", success: true });
  } catch (error) {
    next(error);
  }
});

router.get('/FamilyRecipes', async (req, res, next) => {
  try {
    // Get the user ID from the session
    const username = req.session.username;
    let results = await  user_utils.getRecipeDetailsfromDBfamilyrecipes(username);
    // Send the results as the response with a status code of 200 (OK)
    res.status(200).send(results);
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
});

// Route handler
router.post("/LastViewed", async (req, res, next) => {
  try {
    const username = req.session.username;
    const recipeId = req.body.recipe_id;

    // Call the helper function to check and insert the entry
    await checkAndInsertEntry(username, recipeId);

    res.status(201).send({ message: "Recipe added", success: true });
  } catch (error) {
    res.status(400).send({ message: error.message, success: false });
  }
});


router.get('/LastViewed', async (req, res, next) => {
  try {
    // Get the user ID from the session
    const username = req.session.username;
    let recipes = await  user_utils.getRecipeDetailsfromDB3lastseenrecipes(username);
    const results = [];
    
    for (const recipe of recipes) {
      const recipeDetails = await recipe_utils.getRecipeDetails(recipe.recipe_id);
      results.push(recipeDetails);
    }
    // Send the results as the response with a status code of 200 (OK)
    res.status(200).send(results);
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
});




// Helper function to check and insert the entry
async function checkAndInsertEntry(username, recipeId) {
  // Check if the username and recipe_id already exist in the table
  const existingEntry = await DButils.execQuery(
    `SELECT * FROM 3lastseenrecipes WHERE username = '${username}' AND recipe_id = ${recipeId}`
  );

  if (existingEntry.length > 0) {
    // If the entry already exists, throw an error
    throw new Error("Entry already exists");
  }

  // Insert the new entry into the table
  const currentTime = new Date();
  const formattedTime = currentTime.toISOString().slice(0, 19).replace('T', ' ');

  await DButils.execQuery(
    `INSERT INTO 3lastseenrecipes (username, recipe_id, date) VALUES ('${username}', ${recipeId}, '${formattedTime}')`
  );
}
module.exports = router;
