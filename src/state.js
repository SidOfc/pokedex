import {createStore} from 'solid-js/store';

const [state, setState] = createStore({pokemon: {count: 0, results: []}});

export {state, setState};
