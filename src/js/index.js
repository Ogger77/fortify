import Search from './models/Search';
import Recipe from './models/Recipe';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import { elements, renderLoader, clearLoader } from './views/base';

/*global state of the app
    Search object
    current recipe object
    shopping list object
    liked recipes
*/

//each time reload the app the state is empty
const state = {};

//******************* 
//Search controller
//*******************
const controlSearch = async () => {
    //Get the query from view
    const query = searchView.getInput();
    // const query = 'pizza';

    if(query){
        //New search object and add to state
        state.search = new Search(query);

        //Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
            //Search for recipes
            await state.search.getResults();

            //render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch (err){
            alert('Something went wrong with the search');
            console.log(err);
            clearLoader();
        }
    }
}

elements.searchForm.addEventListener('submit', e =>{
    //prevent reload of the page when hit search
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if(btn){
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});

//***************** 
//Recipe controller
//***************** 
const controlRecipe = async () => {
    //Get Id from url
    const id = window.location.hash.replace('#', '');
    console.log(id);

    if(id){
        //Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //HIghlight selected search item
        if(state.search) 
            searchView.highlightSelected(id);

        //Create new recipe object based on id
        state.recipe = new Recipe(id);

        try {
             //Get recipe data
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            //Calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServing();
            
            //Render recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe);

        } catch(error){
            alert('Error processing recipe');
        }      
    }
};

// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

//Handling recipe button click
elements.recipe.addEventListener('click', e => {
    //select the btn-decrease and all of its child
    if(e.target.matches('.btn-decrease, .btn-decrease *')){
        //Decrease button clicked
        if(state.recipe.servings > 1)
            state.recipe.updateServing('dec');
            recipeView.updateServingsIngredients(state.recipe);
    }else if(e.target.matches('.btn-increase, .btn-increase *')){
        //increase button clicked
        state.recipe.updateServing('inc');
        recipeView.updateServingsIngredients(state.recipe);
    }
    console.log(state.recipe);
})