import { applyMiddleware, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import reducers from './reducers';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
    reducers,
    composeEnhancers(
        // allow async dispatch function
        // 'applyMiddleware' must be the first argument!!
        applyMiddleware(thunk)
    )
);

export default store;