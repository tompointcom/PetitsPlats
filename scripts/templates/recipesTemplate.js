export function recipesTemplate(data) {
    const { id, image, name, servings, ingredients, quantity, unit, time, description, appliance, ustensils } = data;
    const imageSrc = `/assets/JSONrecipes/${image}`;

    function generateRecipeCard() {
        const article = document.createElement('article');
        article.classList.add('recipes-section__recipe-card');

        const img = document.createElement('img');
        img.classList.add('recipes-section__recipe-card__img');
        img.src = imageSrc;
        img.alt = name;

        const timeContainer = document.createElement('span');
        timeContainer.classList.add('recipes-section__recipe-card__time');
        timeContainer.innerHTML = `${time}min`;

        const textContainer = document.createElement('div');
        textContainer.classList.add('recipes-section__recipe-card__text-container');

        const h3 = document.createElement('h3');
        h3.textContent = name;

        const recetteSubtitle = document.createElement('p');
        recetteSubtitle.classList.add('recipes-section__recipe-card__text-container__subtitle');
        recetteSubtitle.textContent = `recette`;

        const recipeDescription = document.createElement('p');
        recipeDescription.classList.add('recipes-section__recipe-card__text-container__description');
        recipeDescription.textContent = description;

        const ingredientsSubtitle = document.createElement('p');
        ingredientsSubtitle.classList.add('recipes-section__recipe-card__text-container__subtitle');
        ingredientsSubtitle.textContent = `ingrédients`;
        ingredientsSubtitle.textContent.toUpperCase();

        const ingredientsList = document.createElement('ul');
        ingredientsList.classList.add('recipes-section__recipe-card__text-container__ingredients-list');
        ingredientsList.innerHTML = ingredients.map((ingredient) => {
            const unit = ingredient.unit && ingredient.unit.includes("grammes") ? "g" : ingredient.unit;
            return `
        <li>
            <span class="ingredient-name">${ingredient.ingredient}</span>
            <span class="ingredient-quantity">${ingredient.quantity ? ingredient.quantity : ""} ${unit ? unit : ""}</span>
        </li>`;
        }).join('');

        article.append(img, timeContainer, textContainer);
        textContainer.append(h3, recetteSubtitle, recipeDescription, ingredientsSubtitle, ingredientsList);
        return article;
    }

    return { generateRecipeCard };
}

