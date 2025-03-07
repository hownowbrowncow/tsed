import {isArray} from "./isArray";
import {isDate} from "./isDate";
import {isFunction} from "./isFunction";
import {isNil} from "./isNil";
import {isPrimitive} from "./isPrimitive";
import {isSymbol} from "./isSymbol";
import {isBuffer} from "./isBuffer";

const isBasicType = (source: any) => isNil(source) || isPrimitive(source) || isSymbol(source) || isFunction(source);

/**
 * Return a cloned value
 * @param source
 * @param stack
 */
export function deepClone(source: any, stack = new WeakMap()): any {
  let dest: any;

  if (isBasicType(source)) {
    return source;
  }

  if (isBuffer(source)) {
    const copy = new Buffer(source.length);
    source.copy(copy);
    return copy;
  }

  if (isDate(source)) {
    return new Date(source);
  }

  const stacked = stack.get(source);

  if (stacked) {
    // See issue #1619
    // istanbul ignore next
    process.env.TSED_TRACK_CIRCULAR_REF && console.trace("Circular ref detected on deepClone", stacked);
    return stacked;
  }

  if (isArray(source)) {
    dest = [];
  } else {
    dest = {};
    stack.set(source, dest);
  }

  for (const key in source) {
    // Use getOwnPropertyDescriptor instead of source[key] to prevent from triggering setter/getter.
    const descriptor = Object.getOwnPropertyDescriptor(source, key)!;

    if (descriptor) {
      if (!isFunction(descriptor.value)) {
        dest[key] = deepClone(descriptor.value, stack);
      } else {
        Object.defineProperty(dest, key, descriptor);
      }
    }
  }

  if (!isArray(source)) {
    const prototype = Reflect.getPrototypeOf(source);
    Reflect.setPrototypeOf(dest, prototype);
  }

  return dest;
}
