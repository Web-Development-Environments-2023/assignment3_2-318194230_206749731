const DButils = require("./DButils");

// Marks a recipe as a favorite for a given user
async function markAsFavorite(username, recipe_id){
    await DButils.execQuery(`insert into favoriterecipes values ('${username}',${recipe_id})`);
}

// Retrieves the favorite recipes for a given user
async function getFavoriteRecipes(username){
    const recipes_id = await DButils.execQuery(`select recipe_id from favoriterecipes where username='${username}'`);
    return recipes_id;
}

// Retrieves recipe details from the "myrecipes" table in the database for a given user
async function getRecipeDetailsfromDBmyrecipes(username) {
    try {
        const query = `SELECT recipe_id, title, image, readyInMinutes, popularity, vegetarian, vegan, glutenFree FROM myrecipes WHERE username = '${username}'`;
        const result = await DButils.execQuery(query);
        return result;
    } catch (error) {
        throw new Error("Failed to retrieve recipes for the specified username.");
    }
}

// Retrieves recipe details from the "familyrecipes" table in the database for a given user
async function getRecipeDetailsfromDBfamilyrecipes(username) {
    try {
        const query = `SELECT username, recipe_id, recipeName, recipeOwner, components, preparationMethod, images, specialOccasions, cookingTime, serves FROM familyrecipes WHERE username = '${username}'`;
        const result = await DButils.execQuery(query);
        return result;
    } catch (error) {
        throw new Error("Failed to retrieve recipes for the specified username.");
    }
}

// Retrieves the last seen recipe details from the "3lastseenrecipes" table in the database for a given user
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

// Inserts a new recipe into the "myrecipes" table in the database
async function insertRecipeToMyRecipes(username, recipeDetails) {
    // Check if the recipe ID already exists in the "myrecipes" table
    const existingRecipe = await DButils.execQuery(
        `SELECT recipe_id FROM myrecipes WHERE recipe_id = ${recipeDetails.recipe_id}`
    );

    if (existingRecipe.length > 0) {
        throw new Error("Recipe ID already exists.");
    }

    // Insert the new recipe into the "myrecipes" table
    await DButils.execQuery(
        `INSERT INTO myrecipes (username, recipe_id, title, image, readyInMinutes, popularity, vegetarian, vegan, glutenFree, extendedIngredients, instructions, servings)
         VALUES ('${username}', ${recipeDetails.recipe_id}, '${recipeDetails.title}', '${recipeDetails.image}', ${recipeDetails.readyInMinutes}, ${recipeDetails.popularity},
                 ${recipeDetails.vegetarian}, ${recipeDetails.vegan}, ${recipeDetails.glutenFree}, '${JSON.stringify(recipeDetails.extendedIngredients)}',
                 '${recipeDetails.instructions.replace(/'/g, "''")}', ${recipeDetails.servings})`
    );
}

// Export all the functions to be used in other modules
exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.getRecipeDetailsfromDBmyrecipes = getRecipeDetailsfromDBmyrecipes;
exports.getRecipeDetailsfromDBfamilyrecipes = getRecipeDetailsfromDBfamilyrecipes;
exports.getRecipeDetailsfromDB3lastseenrecipes = getRecipeDetailsfromDB3lastseenrecipes;
exports.insertRecipeToMyRecipes = insertRecipeToMyRecipes;
