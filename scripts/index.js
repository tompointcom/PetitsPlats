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

    // Display the ingredients, ustensils and appliances in the dropdown
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

    const filterRecipes = () => {
        const selectedIngredients = Array.from(document.querySelectorAll('.active-filter[data-type="ingredient"]')).map(el => el.dataset.value.toLowerCase());
        const selectedUstensils = Array.from(document.querySelectorAll('.active-filter[data-type="ustensil"]')).map(el => el.dataset.value.toLowerCase());
        const selectedAppliances = Array.from(document.querySelectorAll('.active-filter[data-type="appliance"]')).map(el => el.dataset.value.toLowerCase());

        const filteredRecipes = recipes.filter(recipe => {
            const hasIngredients = selectedIngredients.every(ingredient => recipe.ingredients.some(i => i.ingredient.toLowerCase() === ingredient));
            const hasUstensils = selectedUstensils.every(ustensil => recipe.ustensils && recipe.ustensils.some(u => u.toLowerCase() === ustensil));
            const hasAppliances = selectedAppliances.every(appliance => recipe.appliance && recipe.appliance.toLowerCase() === appliance);
            return hasIngredients && hasUstensils && hasAppliances;
        });

        displayData(filteredRecipes);
        populateFilters(filteredRecipes); // Repopulate filters based on filtered recipes
    };

    const searchRecipes = (query) => {
        const lowerCaseQuery = query.toLowerCase();
        const filteredRecipes = recipes.filter(recipe => {
            const matchesTitle = recipe.name.toLowerCase().includes(lowerCaseQuery);
            const matchesDescription = recipe.description.toLowerCase().includes(lowerCaseQuery);
            const matchesIngredients = recipe.ingredients.some(ingredient => ingredient.ingredient.toLowerCase().includes(lowerCaseQuery));
            const matchesUstensils = recipe.ustensils && recipe.ustensils.some(ustensil => ustensil.toLowerCase().includes(lowerCaseQuery));
            return matchesTitle || matchesDescription || matchesIngredients || matchesUstensils;
        });

        if (filteredRecipes.length === 0) {
            recipesContainer.innerHTML = `<p class="notfound-message">Aucune recette ne contient '${query}'. Vous pouvez chercher « tarte aux pommes », « poisson », etc.</p>`;
            updateRecipeCount(0);
        } else {
            displayData(filteredRecipes);
        }
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
            filterRecipes();
        });
        activeFilter.appendChild(removeButton);
        activeFiltersContainer.appendChild(activeFilter);
        filterRecipes();
    };

    document.querySelectorAll('.filter-dropdown__button').forEach(button => {
        button.addEventListener('click', (e) => {
            const filterMenu = e.target.nextElementSibling;
            toggleDropdown(filterMenu);
        });
    });

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

    searchBar.addEventListener('input', (e) => {
        searchRecipes(e.target.value);
    });

    await displayData(recipes);
    populateFilters(recipes);

});