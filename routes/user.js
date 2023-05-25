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
    } else if (!req.session.username) {
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
    console.log("this fuck you : "+username);
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
router.get('/favorites', async (req,res,next) => {
  try{
    const username = req.session.username;
    let favorite_recipes = {};
    const recipes_id = await user_utils.getFavoriteRecipes(username);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreview(recipes_id_array);
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
});

//The next code has Get and Post http request 

router.get('/MyRecipes', async (req, res, next) => {
  try {
    // Get the user ID from the session
    const username = req.session.username;
    // Retrieve the recipe IDs for the logged-in user
    const recipes_id = await user_utils.getMyRecipes(username);
    // Extract the recipe IDs into an array
    const recipes_id_array = recipes_id.map((element) => element.recipe_id);
    // Get the recipe previews using the recipe IDs
    const results = await recipe_utils.getRecipesPreview(recipes_id_array);
    // Send the results as the response with a status code of 200 (OK)
    res.status(200).send(results);
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
});

// router.post("/MyRecipes", async (req, res, next) => {
//   try {
//     // parameters exists
//     // valid parameters
//     // username exists
//     let recipe_details = {
//       recipe_id: req.body.id,
//       title: req.body.title,
//       image: req.body.image,
//       readyInMinutes: req.body.readyInMinutes,
//       popularity: req.body.popularity,
//       vegetarian: req.body.vegetarian,
//       vegan: req.body.vegan,
//       glutenFree: req.body.glutenFree
//     }
//     let recipes = [];
//     RECIPES = await DButils.execQuery("SELECT recipe from recipedetails");

//     if (RECIPES.find((x) => x.recipe_id === user_details.recipe_id))
//       throw { status: 409, message: "recipe_id taken" };

//     // // add the new username
//     // let hash_password = bcrypt.hashSync(
//     //   user_details.password,
//     //   parseInt(process.env.bcrypt_saltRounds)
//     // );
//     await DButils.execQuery(
//       `INSERT INTO recipedetails  VALUES (${recipe_details.recipe_id}, '${recipe_details.title}', '${recipe_details.image}', ${recipe_details.readyInMinutes}, ${recipe_details.popularity}, ${recipe_details.vegetarian}, ${recipe_details.vegan}, ${recipe_details.glutenFree})`
//     );
//     res.status(201).send({ message: "recipe created", success: true });
//   } catch (error) {
//     next(error);
//   }
// });

module.exports = router;
