const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
<<<<<<< HEAD
let spooncular_api_key ='1f0ca9f280ad4ec0887e1958e83c934c'
=======
let spooncular_api_key = process.env.spooncular_api_key
>>>>>>> 08d39d39a8e883ad4681d3a28526d3bdc9e57fe8



/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */
async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: spooncular_api_key
             }
    });
}
function getSteps(ex_list) {
    let count = 0;
  
    if (ex_list == null || ex_list.length == 0) {
      return null;
    }
  
    const steps = ex_list[0].steps;
    if (steps == null) {
      return null;
    }
  
    const short_list = steps.map((element) => `${++count}. ${element.step}`);
    return short_list;
  }
  
<<<<<<< HEAD

function getIngredientsList(ex_list){
    short_list = []
    ex_list.map((element) => short_list.push(element.name +' - ' + element.amount))
    return short_list
}

async function getRecipeDetails(recipe_id, username, includeNutrition_value, search_result) {
    let recipe_info = await getRecipeInformation(recipe_id);
    const { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree,instructions,extendedIngredients,servings,analyzedInstructions} = recipe_info.data;
    let json_data =  {
        recipe_id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
    };

    
    if (includeNutrition_value) {
        json_data.servings = servings
        json_data.instructions = instructions
        json_data.extendedIngredients = getIngredientsList(extendedIngredients)
        return json_data
    }
    
    if (search_result) {
        json_data.extendedIngredients = getIngredientsList(extendedIngredients)
        json_data.analyzedInstructions = getSteps(analyzedInstructions)
        return json_data
    }
    
    return json_data
    
}
=======
>>>>>>> 08d39d39a8e883ad4681d3a28526d3bdc9e57fe8

function getIngredientsList(ex_list){
    short_list = []
    ex_list.map((element) => short_list.push(element.name +' - ' + element.amount))
    return short_list
}

<<<<<<< HEAD
async function getRecipeDet(recipe_id) {
=======
async function getRecipeDetails(recipe_id, username, includeNutrition_value, search_result) {
>>>>>>> 08d39d39a8e883ad4681d3a28526d3bdc9e57fe8
    let recipe_info = await getRecipeInformation(recipe_id);
    const { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree,instructions,extendedIngredients,servings,analyzedInstructions} = recipe_info.data;
    let json_data =  {
        recipe_id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
<<<<<<< HEAD
=======
    };

    
    if (includeNutrition_value) {
        json_data.servings = servings
        json_data.instructions = instructions
        json_data.extendedIngredients = getIngredientsList(extendedIngredients)
        return json_data
>>>>>>> 08d39d39a8e883ad4681d3a28526d3bdc9e57fe8
    }
    
    if (search_result) {
        json_data.extendedIngredients = getIngredientsList(extendedIngredients)
        json_data.analyzedInstructions = getSteps(analyzedInstructions)
        return json_data
    }
    
    return json_data
    
}

async function searchResultsFromApi(query_str, num_of_results, cuisine, diet, intolerances){
    //, num_of_results, cuisine, diet, intolerances
    return await axios.get(`${api_domain}/complexSearch`, {
        params: {
            query: query_str,
            number: num_of_results,
            cuisine: cuisine,
            diet: diet,
            intolerances: intolerances,
            apiKey:spooncular_api_key
        }
    });
}
async function searchResultsFromApi(query_str, num_of_results, cuisine, diet, intolerances){
    //, num_of_results, cuisine, diet, intolerances
    return await axios.get(`${api_domain}/complexSearch`, {
        params: {
            query: query_str,
            number: num_of_results,
            cuisine: cuisine,
            diet: diet,
            intolerances: intolerances,
            apiKey:spooncular_api_key
        }
    });
}


async function searchRecipes(query, numberOfResults , cuisine, diet, intolerances) {
    const search_res = await searchResultsFromApi(query, numberOfResults, cuisine, diet, intolerances);
    const data_results = search_res.data.results;
    const results = [];
    
    for (let i = 0; i < data_results.length; i++) {
      const result = data_results[i];
      const recipeDetails = await getRecipeDetails(result.id, false, true);
      results.push(recipeDetails);
    }
  
    return results;
  }
async function helpRandom(){
    return await axios.get(`${api_domain}/random`, {
        params: {
            number: 1,
            apiKey:spooncular_api_key
        }
    });
}
async function getRandomRecipes() {
    let array = [];
    for (let i = 0; i < 3; i++) {
        let search_response = await helpRandom();
        while(!search_response.data.recipes[0].instructions){
            search_response = await helpRandom();

        }
        array.push(search_response.data.recipes[0])
    }
    let output = array.map((result) => {
        const {
            id,
            title,
            readyInMinutes,
            aggregateLikes,
            vegetarian,
            vegan,
            glutenFree,
            image
        } = result;
        return {
            recipe_id: id,
            title: title,
            readyInMinutes: readyInMinutes,
            image: image,
            popularity: aggregateLikes,
            vegan: vegan,
            vegetarian: vegetarian,
            glutenFree: glutenFree,
        }
    });

    return output;
}

exports.getRandomRecipes = getRandomRecipes
exports.searchRecipes = searchRecipes;
exports.getRecipeDetails = getRecipeDetails;
exports.getRecipeDet=getRecipeDet