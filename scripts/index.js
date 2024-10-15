import { recipesTemplate } from './templates/recipesTemplate.js';

document.addEventListener('DOMContentLoaded', async () => {
    const recipesContainer = document.querySelector('.recipes-section');
    const nbRecipes = document.querySelector('.recipe-count');
    const ingredientFilter = document.getElementById('ingredient-filter');
    const ustensilFilter = document.getElementById('ustensil-filter');
    const applianceFilter = document.getElementById('appliance-filter');
    const activeFiltersContainer = document.querySelector('.active-filters');
    const searchBar = document.querySelector('.searchbar');
    const clearSearchButton = document.querySelector('.clear-search');

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
            const menu = filter.querySelector('.filter-dropdown__menu');
            if (!menu) {
                console.error('Menu element not found in filter:', filter);
                return;
            }
            const searchWrapper = menu.querySelector('.filter-dropdown__search-wrapper');
            const searchInput = searchWrapper.querySelector('.filter-dropdown__searchbar');
            const clearButton = searchWrapper.querySelector('.filter-dropdown__search__clear');

            // Clear existing items
            menu.querySelectorAll('.filter-dropdown__item').forEach(item => item.remove());

            items.forEach(item => {
                const div = document.createElement('div');
                div.className = 'filter-dropdown__item';
                div.dataset.value = item;
                div.textContent = item;
                menu.appendChild(div);
            });

            searchInput.addEventListener('input', () => filterDropdown(searchInput, menu));

            clearButton.addEventListener('click', () => {
                searchInput.value = '';
                filterDropdown(searchInput, menu);
            });
        };

        const ingredientFilter = document.querySelector('#ingredient-filter').closest('.filter-dropdown');
        const ustensilFilter = document.querySelector('#ustensil-filter').closest('.filter-dropdown');
        const applianceFilter = document.querySelector('#appliance-filter').closest('.filter-dropdown');

        if (ingredientFilter) {
            populateDropdown(ingredientFilter, ingredients);
        } else {
            console.error('Ingredient filter parent not found');
        }

        if (ustensilFilter) {
            populateDropdown(ustensilFilter, ustensils);
        } else {
            console.error('Ustensil filter parent not found');
        }

        if (applianceFilter) {
            populateDropdown(applianceFilter, appliances);
        } else {
            console.error('Appliance filter parent not found');
        }
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
        populateFilters(filteredRecipes);
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
            if (item.classList.contains('filter-dropdown__search-wrapper') || item.classList.contains('filter-dropdown__searchbar') || item.classList.contains('filter-dropdown__search-icon')) {
                return;
            }
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(searchText) ? '' : 'none';
        });
    };

    const toggleDropdown = (button, filter) => {
        const isOpen = filter.style.display === 'block';
        filter.style.display = isOpen ? 'none' : 'block';
        button.classList.toggle('open', !isOpen);
    };

    const setupClearButton = (searchInput, clearButton, searchFunction) => {
        const updateClearButtonVisibility = () => {
            clearButton.style.display = searchInput.value ? 'block' : 'none';
        };

        searchInput.addEventListener('input', (e) => {
            updateClearButtonVisibility();
            searchFunction(e.target.value);
        });

        clearButton.addEventListener('click', () => {
            searchInput.value = '';
            updateClearButtonVisibility();
            searchFunction('');
        });

        updateClearButtonVisibility();
    };

    // Setup clear button for the main search bar
    if (searchBar && clearSearchButton) {
        setupClearButton(searchBar, clearSearchButton, searchRecipes);
    }

    // Setup clear buttons for filter search bars
    document.querySelectorAll('.filter-dropdown__search-wrapper').forEach(wrapper => {
        const searchInput = wrapper.querySelector('.filter-dropdown__searchbar');
        const clearButton = wrapper.querySelector('.filter-dropdown__search__clear');
        if (searchInput && clearButton) {
            setupClearButton(searchInput, clearButton, (query) => filterDropdown(searchInput, searchInput.closest('.filter-dropdown__menu')));
        }
    });

    document.querySelectorAll('.filter-dropdown__button').forEach(button => {
        button.addEventListener('click', (e) => {
            const filterMenu = e.target.closest('.filter-dropdown__button').nextElementSibling;
            toggleDropdown(button, filterMenu);
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
        removeButton.innerHTML = `
    <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 11.5L7 6.5M7 6.5L2 1.5M7 6.5L12 1.5M7 6.5L2 11.5" stroke="#1B1B1B" stroke-width="2.16667" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
`;
        removeButton.addEventListener('click', () => {
            activeFilter.remove();
            filterRecipes();
        });
        activeFilter.appendChild(removeButton);
        activeFiltersContainer.appendChild(activeFilter);
        filterRecipes();
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

    searchBar.addEventListener('input', (e) => {
        searchRecipes(e.target.value);
    });

    await displayData(recipes);
    populateFilters(recipes);
});