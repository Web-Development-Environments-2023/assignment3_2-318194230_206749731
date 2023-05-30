var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");

// This path returns a full details of a recipe by its id
 router.get("/FullRecipeReview/:recipeId", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId, true, false);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});

router.get("/:recipeId", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});



module.exports = router;
