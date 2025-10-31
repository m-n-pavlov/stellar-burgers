// Мок для localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
});

// Мок для cookie
jest.mock('../utils/cookie', () => ({
  getCookie: jest.fn(() => null),
  setCookie: jest.fn(),
  deleteCookie: jest.fn()
}));

import store from './store';
import constructorReducer from './slices/constructorSlice/constructorSlice';
import ingredientsReducer from './slices/ingredientsSlice/ingredientsSlice';
import orderReducer from './slices/orderSlice/orderSlice';
import feedReducer from './slices/feedSlice/feedSlice';
import profileOrdersReducer from './slices/profileOrdersSlice/profileOrdersSlice';
import userReducer from './slices/userSlice/userSlice';

describe('rootReducer', () => {
  it('должен иметь правильное начальное состояние всех слайсов', () => {
    const state = store.getState();

    expect(state.burgerConstructor).toEqual(
      constructorReducer(undefined, { type: '' })
    );
    expect(state.ingredients).toEqual(
      ingredientsReducer(undefined, { type: '' })
    );
    expect(state.order).toEqual(orderReducer(undefined, { type: '' }));
    expect(state.feed).toEqual(feedReducer(undefined, { type: '' }));
    expect(state.profileOrders).toEqual(
      profileOrdersReducer(undefined, { type: '' })
    );
    expect(state.user).toEqual(userReducer(undefined, { type: '' }));
  });
});
