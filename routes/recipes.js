var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");
const user_utils = require("./utils/user_utils");


// This path returns a full details of a recipe by its id
router.get("/PreReviewRecipe/:recipeId", async (req, res, next) => {
  try {
    const username = req.session.username;
    const recipes_id = await user_utils.getFavoriteRecipes(username);
    let recipes = await user_utils.getRecipeDetailsfromDBlastseenrecipes(username);
    const recipe = await recipes_utils.getRecipeDet(recipes,recipes_id,req.params.recipeId);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});

 router.get("/fullRecipeReview/:recipeId", async (req, res, next) => {
  try {
    const username = req.session.username;
    const recipes_id = await user_utils.getFavoriteRecipes(username);
    let recipes = await user_utils.getRecipeDetailsfromDBlastseenrecipes(username);
    const recipe = await recipes_utils.getRecipeDetails(recipes,recipes_id,req.params.recipeId);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});

router.get("/searchForRecipe", async (req, res, next) => {
  try {
    const username = req.session.username;
    const recipes = await recipes_utils.searchRecipes(req.query,username);
    res.send(recipes);
  } catch (error) {
    next(error);
  }
});

router.get("/random", async (req, res, next) => {
  try {
    const recipes = await recipes_utils.getRandomRecipes();
    res.status(200).send(recipes);
  } catch (error) {
    next(error);
  }
});






module.exports=router;