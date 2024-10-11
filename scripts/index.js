import { recipesTemplate } from "./templates/recipesTemplate.js";

document.addEventListener('DOMContentLoaded', async () => {
    const recipesContainer = document.querySelector('.recipes-section');
    const nbRecipes = document.querySelector('.recipe-count');
    const ingredientFilter = document.getElementById('ingredient-filter');
    const ustensilFilter = document.getElementById('ustensil-filter');
    const applianceFilter = document.getElementById('appliance-filter');
    const activeFiltersContainer = document.querySelector('.active-filters');
    const searchBar = document.getElementById('searchbar');

    const updateRecipeCount = (count) => {
        nbRecipes.textContent = `${count} recettes`;
    };

    const displayData = (recipes) => {
        recipesContainer.innerHTML = '';
        recipes.forEach(recipe => {
            const recipeCard = recipesTemplate(recipe).generateRecipeCard();
            recipesContainer.append(recipeCard);
        });
        updateRecipeCount(recipes.length);
    };

    const regexSearch = (string, pattern) => {
        const regex = new RegExp(pattern, 'i');
        return regex.test(string);
    };

    const searchRecipes = () => {
        const searchText = searchBar.value.toLowerCase();
        const selectedIngredients = [];
        const selectedUstensils = [];
        const selectedAppliances = [];

        document.querySelectorAll('.active-filter[data-type="ingredient"]').forEach(el => selectedIngredients.push(el.dataset.value.toLowerCase()));
        document.querySelectorAll('.active-filter[data-type="ustensil"]').forEach(el => selectedUstensils.push(el.dataset.value.toLowerCase()));
        document.querySelectorAll('.active-filter[data-type="appliance"]').forEach(el => selectedAppliances.push(el.dataset.value.toLowerCase()));

        const matches = [];
        for (let i = 0; i < recipes.length; i++) {
            const recipe = recipes[i];
            const matchesSearchText = regexSearch(recipe.name, searchText) ||
                recipe.ingredients.some(ingredient => regexSearch(ingredient.ingredient, searchText)) ||
                regexSearch(recipe.description, searchText) ||
                regexSearch(recipe.appliance, searchText) ||
                (recipe.ustensils && recipe.ustensils.some(ustensil => regexSearch(ustensil, searchText)));

            let matchesFilters = true;
            for (let j = 0; j < selectedIngredients.length; j++) {
                if (!recipe.ingredients.some(i => i.ingredient.toLowerCase() === selectedIngredients[j])) {
                    matchesFilters = false;
                    break;
                }
            }
            for (let j = 0; j < selectedUstensils.length; j++) {
                if (!recipe.ustensils || !recipe.ustensils.some(u => u.toLowerCase() === selectedUstensils[j])) {
                    matchesFilters = false;
                    break;
                }
            }
            for (let j = 0; j < selectedAppliances.length; j++) {
                if (!recipe.appliance || recipe.appliance.toLowerCase() !== selectedAppliances[j]) {
                    matchesFilters = false;
                    break;
                }
            }

            if (matchesSearchText && matchesFilters) {
                matches.push(recipe);
            }
        }

        if (matches.length === 0) {
            recipesContainer.innerHTML = `<p class="notfound-message">Aucune recette ne contient '${searchText}'. Vous pouvez chercher « tarte aux pommes », « poisson », etc.</p>`;
            updateRecipeCount(0);
        } else {
            displayData(matches);
        }
    };

    const populateFilters = (recipes) => {
        const ingredients = new Set();
        const ustensils = new Set();
        const appliances = new Set();

        for (let i = 0; i < recipes.length; i++) {
            const recipe = recipes[i];
            if (recipe.ingredients) {
                for (let j = 0; j < recipe.ingredients.length; j++) {
                    ingredients.add(recipe.ingredients[j].ingredient);
                }
            }
            if (recipe.ustensils) {
                for (let j = 0; j < recipe.ustensils.length; j++) {
                    ustensils.add(recipe.ustensils[j]);
                }
            }
            if (recipe.appliance) {
                appliances.add(recipe.appliance);
            }
        }

        const populateDropdown = (filter, items) => {
            filter.innerHTML = '';
            const searchInput = document.createElement('input');
            searchInput.className = 'filter-dropdown__searchbar';
            searchInput.type = 'text';
            filter.appendChild(searchInput);

            items.forEach(item => {
                const div = document.createElement('div');
                div.className = 'filter-dropdown__item';
                div.dataset.value = item;
                div.textContent = item;
                filter.appendChild(div);
            });

            searchInput.addEventListener('input', () => filterDropdown(searchInput, filter));
        };

        populateDropdown(ingredientFilter, ingredients);
        populateDropdown(ustensilFilter, ustensils);
        populateDropdown(applianceFilter, appliances);
    };

    const filterDropdown = (searchInput, filter) => {
        const searchText = searchInput.value.toLowerCase();
        Array.from(filter.children).forEach(item => {
            if (item.classList.contains('filter-dropdown__searchbar')) return;
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(searchText) ? '' : 'none';
        });
    };

    const toggleDropdown = (button, filter) => {
        const isOpen = filter.style.display === 'block';
        filter.style.display = isOpen ? 'none' : 'block';
        button.classList.toggle('open', !isOpen);
    };

    document.querySelectorAll('.filter-dropdown__button').forEach(button => {
        button.addEventListener('click', (e) => {
            const filterMenu = e.target.nextElementSibling;
            toggleDropdown(e.target, filterMenu);
        });
    });

    const selectDropdownItem = (filter, item, type) => {
        const value = item.dataset.value;
        const activeFilter = document.createElement('div');
        activeFilter.className = 'active-filter';
        activeFilter.dataset.type = type;
        activeFilter.dataset.value = value;
        activeFilter.textContent = `${value} `;
        const removeButton = document.createElement('button');
        removeButton.className = 'remove-filter';
        removeButton.textContent = 'x';
        removeButton.addEventListener('click', () => {
            activeFilter.remove();
            searchRecipes();
        });
        activeFilter.appendChild(removeButton);
        activeFiltersContainer.appendChild(activeFilter);
        searchRecipes();
    };

    ingredientFilter.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-dropdown__item')) {
            selectDropdownItem(ingredientFilter, e.target, 'ingredient');
        }
    });

    ustensilFilter.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-dropdown__item')) {
            selectDropdownItem(ustensilFilter, e.target, 'ustensil');
        }
    });

    applianceFilter.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-dropdown__item')) {
            selectDropdownItem(applianceFilter, e.target, 'appliance');
        }
    });

    searchBar.addEventListener('input', () => {
        searchRecipes();
    });

    await displayData(recipes);
    populateFilters(recipes);
});