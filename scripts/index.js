import { recipesTemplate } from "./templates/recipesTemplate.js";

document.addEventListener('DOMContentLoaded', async () => {
    const recipesContainer = document.querySelector('.recipes-section');
    const displayData = (recipes) => {
        recipesContainer.innerHTML = '';
        recipes.forEach(recipe => {
            const recipeCard = recipesTemplate(recipe).generateRecipeCard();
            recipesContainer.append(recipeCard);
        });
    };

    await displayData(recipes);
});

const search = document.getElementById('searchbar');
const results = document.querySelector('.recipes-section');

const stringSearch = (string, pattern) => {
    let count = 0;
    for (let i = 0; i < string.length; i++) {
        for (let j = 0; j < pattern.length; j++) {
            if (pattern[j] !== string[i + j]) break;
            if (j === pattern.length - 1) count++;
        }
    }
    return count;
};

const searchRecipes = (searchText) => {
    const searchTextLower = searchText.toLowerCase();
    const matches = recipes.filter(recipe =>
        stringSearch(recipe.name.toLowerCase(), searchTextLower) > 0 ||
        recipe.ingredients.some(ingredient => stringSearch(ingredient.ingredient.toLowerCase(), searchTextLower) > 0) ||
        stringSearch(recipe.description.toLowerCase(), searchTextLower) > 0 ||
        stringSearch(recipe.appliance.toLowerCase(), searchTextLower) > 0 ||
        (recipe.ustensils && recipe.ustensils.some(ustensil => stringSearch(ustensil.toLowerCase(), searchTextLower) > 0))
    );

    displayData(searchText === "" ? recipes : matches);
};

const displayData = (recipes) => {
    results.innerHTML = "";
    recipes.forEach(recipe => {
        const recipeCard = recipesTemplate(recipe).generateRecipeCard();
        results.append(recipeCard);
    });
};

search.addEventListener('input', () => searchRecipes(search.value));
document.querySelector('.header__search__icon').addEventListener('click', () => searchRecipes(search.value));