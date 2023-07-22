const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
let spooncular_api_key = process.env.spooncular_api_key;
const user_utils = require('./user_utils');



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
    if (steps !=null)
    {
    const short_list = steps.map((element) => `${++count}. ${element.step}`);
    return short_list;
    }
    return null;
  }
  


function getIngredientsList(ex_list){
    short_list = []
    ex_list.map((element) => short_list.push(element.name +' - ' + element.amount))
    return short_list
}

async function getRecipeDetails(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    const { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree,instructions,extendedIngredients,servings,analyzedInstructions} = recipe_info.data;
    let favorite = false;
    let seen = false;
    
    
    let json_data_fullreview =  {
        recipe_id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
        favorite:favorite,
        seen:seen,
        servings:servings,
        analyzedInstructions: getSteps(analyzedInstructions),
        extendedIngredients: getIngredientsList(extendedIngredients),



    };
    
    return json_data_fullreview;
    
}
async function getRecipeDet(recipe_id,seen,favorite) {
    let recipe_info = await getRecipeInformation(recipe_id);
    const { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree, instructions, extendedIngredients, servings, analyzedInstructions } = recipe_info.data;
    
    
   
    let json_data = {
        recipe_id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
        favorite:favorite,
        seen:seen,

        
    };
    return json_data;
}
async function searchResultsFromApi(query_search){
    //, num_of_results, cuisine, diet, intolerances
    if (!query_search.number) {
        query_search.number = 5;
    }
    
    return await axios.get(`${api_domain}/complexSearch`, {
        params: {
            query: query_search.query,
            number: query_search.number,
            cuisine: query_search.cuisine,
            diet: query_search.diet,
            intolerances: query_search.intolerances,
            apiKey:spooncular_api_key
        }
    });
}



async function searchRecipes(query,username) {
    let search_pool = await searchResultsFromApi(query)
    let filtered_search_recipes = search_pool.data.results.filter((search) => (search.instructions != "")&& (search.image !== undefined) )
    const results = [];
    
    for (let i = 0; i < filtered_search_recipes.length; i++) {
      const result = filtered_search_recipes[i];
      const favorite = await user_utils.getFavoriteRecipes(username,result.id);
      let seen = await user_utils.getRecipeDetailsfromDBlastseenrecipes(username,result.id);
      const recipeDetails = await getRecipeDet(result.id);
      recipeDetails.favorite = favorite;
      recipeDetails.seen = seen;
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
exports.getRecipeDet=getRecipeDet;