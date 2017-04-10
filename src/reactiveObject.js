/* eslint no-param-reassign: [2, { "props": false }] */
import Tracker from './tracker';

export default function reactiveProxy(initial = {}, compare = (a, b) => a === b) {
  const deps = {};
  const ensureDep = (name) => {
    if (!deps[name]) deps[name] = new Tracker.Dependency();
    return deps[name];
  };
  return new Proxy(initial, {
    get: (obj, key) => {
      const dep = ensureDep(key);
      dep.depend();
      return obj[key];
    },
    set: (obj, key, value) => {
      const dep = ensureDep(key);
      const oldValue = obj[key];
      obj[key] = value;
      if (!compare(oldValue, value)) dep.changed();
      return value || true;
    },
    deleteProperty: (obj, key) => {
      const dep = ensureDep(key);
      const exists = key in obj;
      delete obj[key];
      if (exists) dep.changed();
      return true;
    },
  });
}
