const DButils = require("./DButils");

async function markAsFavorite(username, recipe_id){
    await DButils.execQuery(`insert into favoriterecipes values ('${username}',${recipe_id})`);
}

async function getFavoriteRecipes(username){
    const recipes_id = await DButils.execQuery(`select recipe_id from favoriterecipes where username='${username}'`);
    return recipes_id;
}


async function getRecipeDetailsfromDBmyrecipes(username)
{
    try {
        const query = `SELECT recipe_id, title, image, readyInMinutes, popularity, vegetarian, vegan, glutenFree FROM myrecipes WHERE username = '${username}'`;
        const result = await DButils.execQuery(query);
        return result;
      } catch (error) {
        throw new Error("Failed to retrieve recipes for the specified username.");
      }

}

async function getRecipeDetailsfromDBfamilyrecipes(username)
{
    try {
        const query = `SELECT username, recipe_id, recipeName,recipeOwner, components, preparationMethod, images, specialOccasions, cookingTime, serves FROM familyrecipes WHERE username = '${username}'`;
        const result = await DButils.execQuery(query);
        return result;
      } catch (error) {
        throw new Error("Failed to retrieve recipes for the specified username.");
      }

}


async function getRecipeDetailsfromDB3lastseenrecipes(username) {
  try {
    const query = `
      SELECT recipe_id
      FROM 3lastseenrecipes
      WHERE username = '${username}'
      ORDER BY date DESC
      LIMIT 3
    `;
    
    const result = await DButils.execQuery(query);
    

    return result;
  } catch (error) {
    throw new Error("Failed to retrieve last seen recipes for the specified username.");
  }
}




exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.getRecipeDetailsfromDBmyrecipes = getRecipeDetailsfromDBmyrecipes;
exports.getRecipeDetailsfromDBfamilyrecipes = getRecipeDetailsfromDBfamilyrecipes;
exports.getRecipeDetailsfromDB3lastseenrecipes = getRecipeDetailsfromDB3lastseenrecipes;
