import { compose, curry, isFunction } from "../utils";
import validators from "../validators";

function create(initial, handler = {}) {
  validators.initial(initial);
  validators.handler(handler);

  const state = { current: initial, listenerList: [], listenerId: 0 };

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

  function unobserveState(id) {
    const index = state.listenerList.findIndex((o) => o.id === id);

    if (index > -1) {
      state.listenerList.splice(index, 1);
    }
  }

  function observeState(observeHandler) {
    validators.handler(observeHandler);

    const newListener = {
      id: ++state.listenerId,
      handler: observeHandler,
    };

    state.listenerList.push(newListener);

    return () => unobserveState(newListener.id);
  }

  return [getState, setState, observeState];
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

  for (const listener of state.listenerList) {
    handleUpdate(state, listener.handler, changes);
  }

  return changes;
}

export { create };
