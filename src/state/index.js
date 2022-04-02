import { compose, curry, isFunction } from "../utils";
import validators from "../validators";

function create(initial, handler = {}) {
  validators.initial(initial);
  validators.handler(handler);

  const state = { current: initial, observers: [] };

  const didUpdate = curry(didStateUpdate)(state, handler);
  const update = curry(updateState)(state);
  const validate = curry(validators.changes)(initial);
  const getChanges = curry(extractChanges)(state);

  function getState(selector = (state) => state) {
    validators.selector(selector);
    return selector(state.current);
  }

  function setState(causedChanges) {
    compose(didUpdate, update, validate, getChanges)(causedChanges);
  }

  function observeState(observeHandler) {
    validators.handler(observeHandler);

    if (state.observers.includes(observeHandler)) {
      return false;
    }

    return state.observers.push(observeHandler) > 0;
  }

  function unobserveState(observeHandler) {
    validators.handler(observeHandler);

    const index = state.observers.indexOf(observeHandler);
    return state.observers.splice(index, index < 0 ? 0 : 1).length > 0;
  }

  return [getState, setState, observeState, unobserveState];
}

function extractChanges(state, causedChanges) {
  return isFunction(causedChanges)
    ? causedChanges(state.current)
    : causedChanges;
}

function updateState(state, changes) {
  state.current = { ...state.current, ...changes };

  return changes;
}

function handleUpdate(state, handler, changes) {
  isFunction(handler)
    ? handler(state.current)
    : Object.keys(changes).forEach((field) =>
        handler[field]?.(state.current[field])
      );
}

function didStateUpdate(state, handler, changes) {
  handleUpdate(state, handler, changes);

  for (const listener of state.observers) {
    handleUpdate(state, listener, changes);
  }

  return changes;
}

export { create };
