import { recipesTemplate } from './templates/recipesTemplate.js';

/**
 * Initializes the application once the DOM content is fully loaded.
 */
document.addEventListener('DOMContentLoaded', async () => {
    const recipesContainer = document.querySelector('.recipes-section');
    const nbRecipes = document.querySelector('.recipe-count');
    const ingredientFilter = document.getElementById('ingredient-filter');
    const ustensilFilter = document.getElementById('ustensil-filter');
    const applianceFilter = document.getElementById('appliance-filter');
    const activeFiltersContainer = document.querySelector('.active-filters');
    const searchBar = document.querySelector('.searchbar');
    const clearSearchButton = document.querySelector('.clear-search');

    /**
     * Updates the displayed recipe count.
     * @param {number} count - The number of recipes to display.
     */
    const updateRecipeCount = (count) => {
        nbRecipes.textContent = `${count} recettes`;
    };

    /**
     * Displays the given recipes in the recipes container.
     * @param {Array} recipes - The recipes to display.
     */
    const displayData = (recipes) => {
        recipesContainer.innerHTML = '';
        for (let i = 0; i < recipes.length; i++) {
            const recipeCard = recipesTemplate(recipes[i]).generateRecipeCard();
            recipesContainer.append(recipeCard);
        }
        updateRecipeCount(recipes.length);
    };

    /**
     * Populates the filter dropdowns with items from the given recipes.
     * @param {Array} recipes - The recipes to extract filter items from.
     */
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

        /**
         * Populates a specific filter dropdown with items.
         * @param {Element} filter - The filter dropdown element.
         * @param {Set} items - The items to populate the dropdown with.
         */
        const populateDropdown = (filter, items) => {
            const menu = filter.querySelector('.filter-dropdown__menu');
            if (!menu) {
                console.error('Menu element not found in filter:', filter);
                return;
            }
            const searchWrapper = menu.querySelector('.filter-dropdown__search-wrapper');
            const searchInput = searchWrapper.querySelector('.filter-dropdown__searchbar');
            const clearButton = searchWrapper.querySelector('.filter-dropdown__search__clear');

            // Remove only the filter items, not the search bar
            const filterItems = menu.querySelectorAll('.filter-dropdown__item');
            filterItems.forEach(item => item.remove());

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

    let mainSearchQuery = '';

    /**
     * Filters the recipes based on the main search query and active filters.
     */
    const filterRecipes = () => {
        const selectedIngredients = [];
        const selectedUstensils = [];
        const selectedAppliances = [];

        const ingredientElements = document.querySelectorAll('.active-filter[data-type="ingredient"]');
        for (let i = 0; i < ingredientElements.length; i++) {
            selectedIngredients.push(ingredientElements[i].dataset.value.toLowerCase());
        }

        const ustensilElements = document.querySelectorAll('.active-filter[data-type="ustensil"]');
        for (let i = 0; i < ustensilElements.length; i++) {
            selectedUstensils.push(ustensilElements[i].dataset.value.toLowerCase());
        }

        const applianceElements = document.querySelectorAll('.active-filter[data-type="appliance"]');
        for (let i = 0; i < applianceElements.length; i++) {
            selectedAppliances.push(applianceElements[i].dataset.value.toLowerCase());
        }

        const filteredRecipes = [];
        for (let i = 0; i < recipes.length; i++) {
            const recipe = recipes[i];
            const matchesMainSearch = mainSearchQuery === '' || recipe.name.toLowerCase().includes(mainSearchQuery) ||
                recipe.description.toLowerCase().includes(mainSearchQuery) ||
                recipe.ingredients.some(ingredient => ingredient.ingredient.toLowerCase().includes(mainSearchQuery)) ||
                (recipe.ustensils && recipe.ustensils.some(ustensil => ustensil.toLowerCase().includes(mainSearchQuery)));

            const hasIngredients = selectedIngredients.every(ingredient => recipe.ingredients.some(i => i.ingredient.toLowerCase() === ingredient));
            const hasUstensils = selectedUstensils.every(ustensil => recipe.ustensils && recipe.ustensils.some(u => u.toLowerCase() === ustensil));
            const hasAppliances = selectedAppliances.every(appliance => recipe.appliance && recipe.appliance.toLowerCase() === appliance);

            if (matchesMainSearch && hasIngredients && hasUstensils && hasAppliances) {
                filteredRecipes.push(recipe);
            }
        }

        if (filteredRecipes.length === 0) {
            recipesContainer.innerHTML = `<p class="notfound-message">Aucune recette ne contient '${mainSearchQuery}'. Vous pouvez chercher « tarte aux pommes », « poisson », etc.</p>`;
            updateRecipeCount(0);
        } else {
            displayData(filteredRecipes);
            populateFilters(filteredRecipes); // Update filters based on displayed recipes
        }
    };

    /**
     * Handles the main search query input and triggers filtering.
     * @param {string} query - The search query.
     */
    const searchRecipes = (query) => {
        mainSearchQuery = query.toLowerCase();
        filterRecipes();
    };

    searchBar.addEventListener('input', (e) => {
        searchRecipes(e.target.value);
    });

    /**
     * Filters the dropdown items based on the search input.
     * @param {Element} searchInput - The search input element.
     * @param {Element} filter - The filter dropdown menu element.
     */
    const filterDropdown = (searchInput, filter) => {
        const searchText = searchInput.value.toLowerCase();
        const children = filter.children;
        for (let i = 0; i < children.length; i++) {
            const item = children[i];
            if (item.classList.contains('filter-dropdown__search-wrapper') || item.classList.contains('filter-dropdown__searchbar') || item.classList.contains('filter-dropdown__search-icon')) {
                continue;
            }
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(searchText) ? '' : 'none';
        }
    };

    /**
     * Toggles the visibility of a dropdown menu.
     * @param {Element} button - The button that toggles the dropdown.
     * @param {Element} filter - The filter dropdown menu element.
     */
    const toggleDropdown = (button, filter) => {
        const isOpen = filter.style.display === 'block';
        filter.style.display = isOpen ? 'none' : 'block';
        button.classList.toggle('open', !isOpen);
    };

    /**
     * Sets up the clear button functionality for a search input.
     * @param {Element} searchInput - The search input element.
     * @param {Element} clearButton - The clear button element.
     * @param {Function} searchFunction - The function to call on search input.
     */
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
    const filterSearchWrappers = document.querySelectorAll('.filter-dropdown__search-wrapper');
    for (let i = 0; i < filterSearchWrappers.length; i++) {
        const wrapper = filterSearchWrappers[i];
        const searchInput = wrapper.querySelector('.filter-dropdown__searchbar');
        const clearButton = wrapper.querySelector('.filter-dropdown__search__clear');
        if (searchInput && clearButton) {
            setupClearButton(searchInput, clearButton, () => filterDropdown(searchInput, searchInput.closest('.filter-dropdown__menu')));
        }
    }

    const filterButtons = document.querySelectorAll('.filter-dropdown__button');
    for (let i = 0; i < filterButtons.length; i++) {
        const button = filterButtons[i];
        button.addEventListener('click', (e) => {
            const filterMenu = e.target.closest('.filter-dropdown__button').nextElementSibling;
            toggleDropdown(button, filterMenu);
        });
    }

    /**
     * Selects a dropdown item and adds it to the active filters.
     * @param {Element} filter - The filter dropdown element.
     * @param {Element} item - The selected item element.
     * @param {string} type - The type of filter (ingredient, ustensil, appliance).
     */
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