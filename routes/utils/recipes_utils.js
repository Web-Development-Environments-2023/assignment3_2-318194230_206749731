const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";



/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */
async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey:'0bd11a8b7e65479fb82795f6f7730888'    //process.env.spooncular_apiKey    dont forget to return to this !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
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
  

function getIngredientsList(ex_list){
    short_list = []
    ex_list.map((element) => short_list.push(element.name +' - ' + element.amount))
    return short_list
}

async function getRecipeDetails(recipe_id, username, includeNutrition_value, search_result) {
    
    // favorites = getFavoriteRecipes(recipe_id,username)
    // favorite = recipe_id in list_seen
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
        // favorite:favorite,
        // seen:seen,

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

async function searchResultsFromApi(query_str, num_of_results, cuisine, diet, intolerances){
    //, num_of_results, cuisine, diet, intolerances
    return await axios.get(`${api_domain}/complexSearch`, {
        params: {
            query: query_str,
            number: num_of_results,
            cuisine: cuisine,
            diet: diet,
            intolerances: intolerances,
            apiKey:'0bd11a8b7e65479fb82795f6f7730888'    //process.env.spooncular_apiKey    dont forget to return to this !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
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
  
  async function helfuncRandomRecipesApi(){
    return await axios.get(`${api_domain}/random`, {
        params: {
            number:3,
            apiKey:'0bd11a8b7e65479fb82795f6f7730888'    //process.env.spooncular_apiKey    dont forget to return to this !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        }
    });

  }
//   async function getRandomRecipes(){
//     let random_list  = await helfuncRandomRecipesApi();
//     let filtered_random_list = random_list.data.recipes.filter((random) => (random.instructions != "") && (random.image)) 
//     if (filtered_random_list.length < 3)
//         return getRandomThreeRecipes(); //again
//     return extractPreviewRecipeDetails(user_id,[filtered_random_list[0], filtered_random_list[1], filtered_random_list[2]]);

//     }

async function extractPreviewRecipeDetails(username,recipes_info){
    recipes=[]
    for (const recipe_info of recipes_info){    
        if(recipe_info){
            const { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info;
            // let hasWatched = false
            // let hasFavorited = false
            // if (user_id){
            //     hasWatched= await user_utils.checkIfWatchedRecipes(user_id,id)
            //     hasFavorited = await user_utils.checkIfFavoriteRecipes(user_id,id)}
            recipes.push({
                id: id,
                title: title,
                readyInMinutes: readyInMinutes,
                image: image,
                popularity: aggregateLikes,
                vegan: vegan,
                vegetarian: vegetarian,
                glutenFree: glutenFree,
                // hasWatched: hasWatched,
                // hasFavorited: hasFavorited
            })
        }
    }
    return recipes;
}

async function getRandomThreeRecipes(username) {
    const random_list = await helfuncRandomRecipesApi();
    const filtered_random_list = random_list.data.recipes.filter(
      (random) => random.instructions !== "" && random.image
    );
  
    if (filtered_random_list.length < 3) {
      return getRandomThreeRecipes();
    }
  
    const selectedRecipes = [
      filtered_random_list[0],
      filtered_random_list[1],
      filtered_random_list[2],
    ];
  
    return extractPreviewRecipeDetails(username, selectedRecipes);
  }
  


exports.getRandomThreeRecipes=getRandomThreeRecipes;
exports.searchRecipes = searchRecipes;
exports.getRecipeDetails = getRecipeDetails;



