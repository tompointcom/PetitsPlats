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
        const selectedIngredients = Array.from(document.querySelectorAll('.active-filter[data-type="ingredient"]')).map(el => el.dataset.value.toLowerCase());
        const selectedUstensils = Array.from(document.querySelectorAll('.active-filter[data-type="ustensil"]')).map(el => el.dataset.value.toLowerCase());
        const selectedAppliances = Array.from(document.querySelectorAll('.active-filter[data-type="appliance"]')).map(el => el.dataset.value.toLowerCase());

        const matches = recipes.filter(recipe => {
            const matchesSearchText = regexSearch(recipe.name, searchText) ||
                recipe.ingredients.some(ingredient => regexSearch(ingredient.ingredient, searchText)) ||
                regexSearch(recipe.description, searchText) ||
                regexSearch(recipe.appliance, searchText) ||
                (recipe.ustensils && recipe.ustensils.some(ustensil => regexSearch(ustensil, searchText)));

            const matchesFilters = selectedIngredients.every(ingredient => recipe.ingredients.some(i => i.ingredient.toLowerCase() === ingredient)) &&
                selectedUstensils.every(ustensil => recipe.ustensils && recipe.ustensils.some(u => u.toLowerCase() === ustensil)) &&
                selectedAppliances.every(appliance => recipe.appliance && recipe.appliance.toLowerCase() === appliance);

            return matchesSearchText && matchesFilters;
        });

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

        recipes.forEach(recipe => {
            if (recipe.ingredients) {
                recipe.ingredients.forEach(ingredient => ingredients.add(ingredient.ingredient));
            }
            if (recipe.ustensils) {
                recipe.ustensils.forEach(ustensil => ustensils.add(ustensil));
            }
            if (recipe.appliance) {
                appliances.add(recipe.appliance);
            }
        });

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