/// <reference types="cypress" />

describe('Конструктор бургеров', () => {
  beforeEach(() => {
    // Перехватываем запрос на ингредиенты и возвращаем фикстуры
    cy.intercept('GET', '**/api/ingredients', {
      fixture: 'ingredients.json'
    }).as('getIngredients');

    // Мок данных пользователя (эндпоинт) — возвращаем fixture
    cy.intercept('GET', '**/api/auth/user', { fixture: 'user.json' }).as(
      'getUser'
    );

    // Подставляем токены в localStorage перед загрузкой приложения
    cy.fixture('user.json').then((user) => {
      // если в fixture accessToken хранится с префиксом "Bearer ", оставляем как есть
      cy.window().then((win) => {
        win.localStorage.setItem('accessToken', user.accessToken);
        win.localStorage.setItem('refreshToken', user.refreshToken);
      });
    });

    // Перехват создания заказа: проверяем заголовок Authorization и отвечаем фикстурой
    cy.intercept('POST', '**/api/orders', (req) => {
      // если приложение помещает токен в заголовок Authorization
      // допустимая форма: "Bearer test-access-token"
      expect(req.headers).to.have.property('authorization');
      expect(req.headers.authorization).to.include('test-access-token');
      req.reply({ fixture: 'order.json' });
    }).as('createOrder');

    // Открываем страницу конструктора
    cy.visit('/');
    cy.wait('@getIngredients');
    cy.wait('@getUser'); // дождёмся данных пользователя, если это важно для UI
  });

  it('Добавляет булку и начинку в конструктор', () => {
    // Добавляем булку
    cy.get('[data-cy=ingredient-bun]').first().click();
    cy.get('[data-cy=constructor-bun-top]').should('exist');
    cy.get('[data-cy=constructor-bun-bottom]').should('exist');

    // Добавляем начинку
    cy.get('[data-cy=ingredient-main]').first().click();
    cy.get('[data-cy=constructor-ingredient]').should('have.length', 1);
  });

  it('Открытие и закрытие модального окна ингредиента', () => {
    // Открываем модалку ингредиента
    cy.get('[data-cy=ingredient-main]').first().click();
    cy.get('[data-cy=ingredient-modal]').should('exist');

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
    cy.get('[data-cy=ingredient-bun]').first().click();

    // Добавляем начинку
    cy.get('[data-cy=ingredient-main]').first().click();

    // Оформляем заказ
    cy.get('[data-cy=order-button]').click();

    // Проверяем открытие модального окна заказа и номер
    cy.wait('@createOrder');
    cy.get('[data-cy=order-modal]').should('exist');
    cy.get('[data-cy=order-number]').should('contain.text', '12345'); // номер из фикстуры

    // Закрываем модалку
    cy.get('[data-cy=modal-close]').click();
    cy.get('[data-cy=order-modal]').should('not.exist');

    // Конструктор должен быть пуст
    cy.get('[data-cy=constructor-bun-top]').should('not.exist');
    cy.get('[data-cy=constructor-ingredient]').should('not.exist');
    cy.get('[data-cy=constructor-bun-bottom]').should('not.exist');
  });
});
