/// <reference types="cypress" />

describe('Интеграционные тесты для страницы конструктора бургера:', () => {
  beforeEach(() => {
    // Перехватываем запрос ингредиентов до загрузки страницы и возвращаем фикстуры
    cy.intercept('GET', '**/api/ingredients', {
      fixture: 'ingredients.json'
    }).as('getIngredients');

    // Перехватываем запрос данных пользователя и возвращаем фикстуры
    cy.intercept('GET', '**/api/auth/user', { fixture: 'user.json' }).as(
      'getUser'
    );

    // Перехватываем запрос создания заказа и возвращаем фикстуры
    cy.intercept('POST', '**/api/orders', (req) => {
      req.reply({ fixture: 'order.json' });
    }).as('createOrder');

    // Подставляем токены авторизации перед загрузкой приложения:
    cy.fixture('user.json').then((user) => {
      // accessToken в cookie для авторизации на сервере
      cy.setCookie('accessToken', user.accessToken);
      // refreshToken в localStorage для обновления токена
      cy.window().then((win) => {
        win.localStorage.setItem('refreshToken', user.refreshToken);
      });
    });

    // Открываем страницу конструктора и ждём данные
    cy.visit('/');
    cy.wait('@getIngredients');
    cy.wait('@getUser');
  });

  afterEach(() => {
    // Явная очистка токенов после каждого теста
    cy.clearCookie('accessToken');
    cy.window().then((win) => {
      win.localStorage.removeItem('refreshToken');
    });
  });

  it('Добавляет булку и начинку в конструктор', () => {
    cy.get('[data-cy=ingredient-bun]').first().find('button').click(); // компонент: BurgerIngredientUI, клик на кнопку добавления булки
    cy.get('[data-cy=constructor-bun-top]').should('exist'); // компонент: BurgerConstructorUI, проверка верхней булки в конструкторе
    cy.get('[data-cy=constructor-bun-bottom]').should('exist'); // компонент: BurgerConstructorUI, проверка нижней булки в конструкторе

    cy.get('[data-cy=ingredient-main]').first().find('button').click(); // компонент: BurgerIngredientUI, клик на кнопку добавления начинки
    cy.get('[data-cy=constructor-ingredient]').should('have.length', 1); // компонент: BurgerConstructorElementUI, проверка начинки в конструкторе
  });

  it('Открытие и закрытие модального окна ингредиента', () => {
    // Запоминаем название ингредиента перед кликом
    cy.get('[data-cy=ingredient-main]')
      .first()
      .find('p')
      .last()
      .invoke('text')
      .as('expectedName');

    // Открываем модалку ингредиента
    cy.get('[data-cy=ingredient-main]').first().click();
    cy.get('[data-cy=ingredient-modal]').should('exist');

    // Проверяем что в модалке отображается название того же ингредиента
    cy.get('@expectedName').then((name) => {
      cy.get('[data-cy=ingredient-modal]').should('contain', name);
    });

    // Закрытие крестиком
    cy.get('[data-cy=modal-close]').click();
    cy.get('[data-cy=ingredient-modal]').should('not.exist');

    // Открываем снова и закрываем оверлеем
    cy.get('[data-cy=ingredient-main]').first().click();
    cy.get('[data-cy=modal-overlay]').click({ force: true });
    cy.get('[data-cy=ingredient-modal]').should('not.exist');
  });

  it('Создание заказа', () => {
    // Добавляем булку
    cy.get('[data-cy=ingredient-bun]').first().find('button').click();

    // Добавляем начинку
    cy.get('[data-cy=ingredient-main]').first().find('button').click();

    // Оформляем заказ
    cy.get('[data-cy=order-button]').click();

    // Проверяем открытие модального окна заказа и номер
    cy.wait('@createOrder');
    cy.get('[data-cy=order-modal]').should('exist');
    cy.get('[data-cy=order-number]').should('contain.text', '92846'); // номер из фикстуры

    // Закрываем модалку
    cy.get('[data-cy=modal-close]').click();
    cy.get('[data-cy=order-modal]').should('not.exist');

    // Конструктор должен быть пуст
    cy.get('[data-cy=constructor-bun-top]').should('not.exist');
    cy.get('[data-cy=constructor-ingredient]').should('not.exist');
    cy.get('[data-cy=constructor-bun-bottom]').should('not.exist');
  });
});
