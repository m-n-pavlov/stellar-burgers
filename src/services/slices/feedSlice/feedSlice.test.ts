import feedReducer, { fetchFeedOrders, clearFeed } from './feedSlice';
import { TOrdersData } from '@utils-types';

describe('feedSlice', () => {
  const initialState = {
    orders: [],
    total: 0,
    totalToday: 0,
    isLoading: false,
    error: null
  };

  it('должен возвращать начальное состояние', () => {
    expect(feedReducer(undefined, { type: '' })).toEqual(initialState);
  });

  it('fetchFeedOrders.pending - isLoading = true', () => {
    const state = feedReducer(initialState, { type: fetchFeedOrders.pending.type });
    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('fetchFeedOrders.fulfilled - сохраняет заказы и total, totalToday', () => {
    const payload: TOrdersData = {
      orders: [{ _id: '1', number: 1, name: 'Order1', status: 'done', createdAt: '', updatedAt: '', ingredients: [] }],
      total: 10,
      totalToday: 5
    };
    const state = feedReducer(initialState, { type: fetchFeedOrders.fulfilled.type, payload });
    expect(state.isLoading).toBe(false);
    expect(state.orders).toEqual(payload.orders);
    expect(state.total).toBe(payload.total);
    expect(state.totalToday).toBe(payload.totalToday);
    expect(state.error).toBeNull();
  });

  it('fetchFeedOrders.rejected - сохраняет ошибку и isLoading = false', () => {
    const state = feedReducer(initialState, { type: fetchFeedOrders.rejected.type, payload: 'Ошибка' });
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Ошибка');
  });

  it('clearFeed - сбрасывает состояние в начальное', () => {
    const modifiedState = {
      orders: [{ _id: '1', number: 1, name: 'Order1', status: 'done', createdAt: '', updatedAt: '', ingredients: [] }],
      total: 10,
      totalToday: 5,
      isLoading: true,
      error: 'Ошибка'
    };
    const state = feedReducer(modifiedState, clearFeed());
    expect(state).toEqual(initialState);
  });
});
