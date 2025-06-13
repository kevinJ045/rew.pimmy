rew.prototype.mod.prototype.defineNew("/home/makano/workspace/pimmy/main.coffee", {
"/home/makano/workspace/pimmy/main.coffee"(globalThis){
with (globalThis) {
  rew.prototype.mod.prototype.package("pimmy");
rew.prototype.mod.prototype.find(module, "#std!");
rew.prototype.mod.prototype.find(module, "#std.yaml");
using(pub(namespace(rew.prototype.ns)));

rew.prototype.mod.prototype.find(module, "./features/loader/main.coffee");
rew.prototype.mod.prototype.find(module, "./features/logger/main.coffee");
rew.prototype.mod.prototype.find(module, "./features/utils/main.coffee");
rew.prototype.mod.prototype.find(module, "./features/init/main.coffee");
rew.prototype.mod.prototype.find(module, "./features/builder/main.coffee");
rew.prototype.mod.prototype.find(module, "./features/cache/main.coffee");
rew.prototype.mod.prototype.find(module, "./features/repo/main.coffee");
rew.prototype.mod.prototype.find(module, "./features/git/main.coffee");
rew.prototype.mod.prototype.find(module, "./features/project/main.coffee");
rew.prototype.mod.prototype.find(module, "./features/cli/main.coffee");

// type
using(pimmy.prototype.cli.prototype.option('app', {type: 'string', alias: 'A'}))
using(pimmy.prototype.cli.prototype.option('repo', {type: 'string', alias: 'R'}))
using(pimmy.prototype.cli.prototype.option('cached', {type: 'string', alias: 'C'}))
using(pimmy.prototype.cli.prototype.option('new', {type: 'string', alias: 'N'}))
// action
using(pimmy.prototype.cli.prototype.option('sync', {type: 'boolean', alias: 'S'}))
using(pimmy.prototype.cli.prototype.option('cache', {type: 'boolean', alias: 'c'}))
using(pimmy.prototype.cli.prototype.option('remove', {type: 'boolean', alias: 'r'}))
using(pimmy.prototype.cli.prototype.option('add', {type: 'boolean', alias: 'a'}))
using(pimmy.prototype.cli.prototype.option('list', {type: 'boolean', alias: 'l'}))
using(pimmy.prototype.cli.prototype.option('build', {type: 'boolean', alias: 'b'}))
using(pimmy.prototype.cli.prototype.option('git', {type: 'boolean', alias: 'g'}))
using(pimmy.prototype.cli.prototype.option('types', {type: 'boolean', alias: 't'}))
using(pimmy.prototype.cli.prototype.option('ignore', {type: 'boolean', alias: 'i'}))
// general
using(pimmy.prototype.cli.prototype.option('safe', {type: 'boolean', alias: 's'}))
// misc
using(pimmy.prototype.cli.prototype.option('verbose', {type: 'boolean', alias: 'v'}))
using(pimmy.prototype.cli.prototype.option('help', {type: 'boolean', alias: 'h'}))
using(pimmy.prototype.cli.prototype.parse(rew.prototype.process.prototype.args));

pimmy.prototype.logger.prototype.LOG = cli_options.verbose;
pimmy.prototype.init.prototype.start();
pimmy.prototype.repo.prototype.init();

module.exports.main =  async function main() {
  if (cli_options.new) {
    return pimmy.prototype.project.prototype.new(cli_options)
  }

  // when building, do not resolve the app elsewhere unless cache is enabled
  if (cli_options.build && typeof cli_options.app == 'string') {
    if (cli_options.cache) {
      cli_options.app = await pimmy.prototype.cache.prototype.resolve(cli_options.app)
    }
    pimmy.prototype.builder.prototype.build(cli_options.app, cli_options.safe)
    return
  }

  if (typeof cli_options.app == 'string') {
    cli_options.app = await pimmy.prototype.cache.prototype.resolve(cli_options.app)
    if (!cli_options.app) return
  }    

  if (cli_options.sync) {
    if (cli_options.repo) {
      return pimmy.prototype.repo.prototype.sync_all(cli_options.repo)
    }
    else if (cli_options.app) {
      return pimmy.prototype.cache.prototype.install(cli_options.app, true)
    };return
  }
  else if (cli_options.add) {
    if (cli_options.repo) {
      return pimmy.prototype.repo.prototype.sync_all(cli_options.repo)
    }
    else if (cli_options.app) {
      return pimmy.prototype.cache.prototype.install(cli_options.app)
    };return
  };return
}





}
return globalThis.module.exports;
}          
}, ["app://rew.pimmy/main"]);(function(module){
rew.prototype.mod.prototype.find(module, "#std.ffi!")
rew.prototype.mod.prototype.find(module, "#std.types!");
rew.prototype.mod.prototype.find(module, "#std.conf")
rew.prototype.mod.prototype.find(module, "#std.encoding")
rew.prototype.mod.prototype.find(module, "#std.fs")
rew.prototype.mod.prototype.find(module, "#std.os")
rew.prototype.mod.prototype.find(module, "#std.path")
rew.prototype.mod.prototype.find(module, "#std.shell")
rew.prototype.mod.prototype.find(module, "#std.threads")
rew.prototype.mod.prototype.find(module, "#std.http")
})({filename: "#std"});(function(module){
"no-compile"
//declare* "=ffi_type" = rew::ffi::typed;
if(!rew.extensions.has('ffi')) rew.extensions.add('ffi', (Deno) => rew.extensions.createClass({
  _namespace(){
    return "ffi";
  },
  cwd(){},
  pre(...types){
    return () => types;
  },
  typed: (...types) => {
    if(!types.length) return;
    const fn = types.pop();
    if(typeof fn != "function") return;
    let returnType = fn();
    let pre;
    if(Array.isArray(returnType)){
      pre = returnType.pop();
      returnType = returnType[0];
    }
    return {
      pre: pre,
      parameters: types,
      result: returnType
    };
  },
  void: "void",
  ptr: "pointer",
  buffer: "buffer",
  u8: "u8",
  u16: "u16",
  u32: "u32",
  u64: "u64",
  i8: "i8",
  i16: "i16",
  i32: "i32",
  i64: "i64",
  f32: "f32",
  f64: "f64",
  struct: (def) => ({ struct: def }),
  open_raw: (libPath, symbols) => {
    try {
      return Deno.dlopen(libPath, symbols);
    } catch (e) {
      throw new Error(`Failed to load dynamic library "${libPath}": ${e.message}`);
    }
  },
  open(libPath, instance) {
    const entries = Object.entries(instance);
    const symbols = {};

    for (const [funcName, def] of entries) {
      if (!def || typeof def !== "object") {
        throw new Error(`Invalid FFI definition for "${funcName}".`);
      }

      const symbolName = funcName;
      try {
        symbols[symbolName] = {
          parameters: def.parameters.map(p => this._mapType(p)),
          result: this._mapType(def.result)
        };
      } catch (err) {
        throw new Error(`Error mapping FFI types for "${funcName}": ${err.message}`);
      }
    }

    let nativeSymbols;
    try {
      ({ symbols: nativeSymbols } = Deno.dlopen(libPath, symbols));
    } catch (e) {
      throw new Error(`Failed to load dynamic library "${libPath}": ${e.message}`);
    }

    const wrappers = {};
    for (const [funcName, def] of entries) {
      const symbolName = funcName;
      wrappers[funcName] = (...args) => {
        try {
          const result = nativeSymbols[symbolName](...args);
          return def.pre ? def.pre(result) : result;
        } catch (e) {
          throw new Error(`FFI call "${funcName}" failed: ${e.message}`);
        }
      };
    }

    const generated = {};
    for (const funcName of Object.keys(wrappers)) {
      Object.defineProperty(generated, funcName, {
        value: (...args) => wrappers[funcName](...args),
        enumerable: true
      });
    }

    return generated;
  },
  autoload(libPath){
    const { symbols: meta } = Deno.dlopen(libPath, {
      __rew_symbols: { parameters: [], result: "pointer" },
    });
    
    const view = new Deno.UnsafePointerView(meta.__rew_symbols());
    const json = view.getCString();
    const def = JSON.parse(json);
    
    const ffiDef = this._translateFFIData(def);
    // rew.prototype.io.prototype.out.print(ffiDef);
    
    const lib = Deno.dlopen(libPath, ffiDef);

    return this._buildFFI(def, lib);
  },
  _translateFFIData(meta) {
    const result = {};
  
    for (const [symbolName, symbol] of Object.entries(meta)) {
      if (symbol.kind !== "Function") continue;
  
      const sig = symbol.signature;
      const parts = sig.match(/fn\s+\w+\((.*?)\)(?:\s*->\s*(\S+))?/);
  
      const paramList = parts?.[1]?.split(",").filter(Boolean) ?? [];
      const returnType = parts?.[2]?.trim() ?? "void";
  
      const parameters = paramList.map(param => {
        const typeStr = param.split(/\s*:\s*/)[1]?.trim();
        return this._mapTypeRust(typeStr || "pointer");
      });

      result[symbol.name] = {
        parameters,
        result: this._mapTypeRust(returnType),
      };
    }
  
    return result;
  },  
  _mapType(type) {
    if (typeof type === "string") return type;
    if (type === this.ptr) return "pointer";
    if (type === this.buffer) return "buffer";
    if (typeof type === "object" && type.struct) {
      return {
        struct: type.struct
      };
    }
    throw new Error(`Unsupported FFI type: ${JSON.stringify(type)}`);
  },
  _buildFFI(meta, lib) {
    const result = {};
    const structs = {};

    for (const [symbolName, symbol] of Object.entries(meta)) {
      if (symbol.kind === "Function") {
        const { name, signature } = symbol;

        const isMethod = name.includes("::");
        const parts = signature.match(/fn\s+\w+\((.*?)\)(?:\s*->\s*(\S+))?/);
        const paramList = parts?.[1]?.split(",").filter(Boolean) ?? [];
        const returnType = parts?.[2]?.trim() ?? null;

        const params = paramList.map(param => {
          const [_name, typeStr] = param.trim().split(/\s*:\s*/);
          return this._mapTypeRust(typeStr);
        });

        const fn = lib.symbols[name];
        if (!fn) {
          continue;
        }

        const jsWrapper = (...args) => fn(...args);

        if (isMethod) {
          const [structName, methodName] = name.split("::");
          if (!structs[structName]) structs[structName] = {};
          structs[structName][methodName] = jsWrapper;
        } else {
          result[name] = jsWrapper;
        }
      }

      if (symbol.kind === "Struct") {
        const { name, fields } = symbol;
        if (!structs[name]) structs[name] = {};
        structs[name]._fields = fields;
      }
    }

    for (const [structName, methods] of Object.entries(structs)) {
      result[structName] = class {
        constructor(ptr) {
          this.ptr = ptr;
        }

        static _fields = methods._fields ?? [];

        static from(ptr) {
          return new result[structName](ptr);
        }

        static registerMethods() {
          for (const [key, fn] of Object.entries(methods)) {
            if (key === "_fields") continue;
            this.prototype[key] = function (...args) {
              return fn(this.ptr, ...args);
            };
          }
        }
      };

      result[structName].registerMethods();
    }

    return result;
  },
  _mapTypeRust(type) {
    if(!type) return "pointer";
    const base = type.replace(/\.ty$/, "").trim();
  
    switch (base) {
      case "i32": return "i32";
      case "i64": return "i64";
      case "f32": return "f32";
      case "f64": return "f64";
      case "bool": return "u8";
      case "void": return "void";
      case "Callback": return "function";
      case "* const std :: os :: raw :: c_char":
      case "* const c_char":
      case "* mut c_char":
      case "char_ptr":
        return "pointer";
      default:
        if (base.startsWith("*")) return "pointer";
        return "pointer";
    }
  }
}));
})({filename: "#std.ffi"});(function(module){
"no-compile"

//declare* "=typedef" = rew::types::typedef;
//declare* "=int" = rew::types::int;
//declare* "=str" = rew::types::str;
//declare* "=float" = rew::types::float;
//declare* "=num" = rew::types::num;
//declare* "=bool" = rew::types::bool;
//declare* "=typef" = rew::types::typef;
//declare* "=struct" = struct;

const _defaultConstructors = {
	string: String,
	array: Array,
	number: Number,
	bigint: BigInt,
	boolean: Boolean,
	symbol: Symbol,
	undefined: Object,
	object: Object,
	function: Function,
};

function getType(value) {
	return typeof value === 'object' ? (Array.isArray(value) ? 'array' : typeof value) : typeof value;
}

class Type{
	constructor(o){
		for(let i in o){
			this[i] = o[i];
		}
	}

}

function typedef(value, strict = false) {
	if(typeof value == "function" && value.type instanceof Type){
		value = value.type;
	}
	return value instanceof Type ? value : new Type({
		strict,
		defaultValue: value,
		class:
			typeof value == 'function'
				? value
				: typeof value === 'object' && value !== null && !Array.isArray(value)
					? value.constructor
					: _defaultConstructors[getType(value)],
		type: getType(value),
		isConstructed: typeof value === 'object' && value !== null && !Array.isArray(value),
		isEmpty: typeof value == 'object' ? !Object.keys(value).length : typeof value == 'string' ? value == '' : typeof value !== 'function',
		or(...others){
			return [this, ...others];
		}
	});
}

function typef(fn, returnType, argumentsTypes) {
	if(typeof returnType == "function"){
		const ref = fn;
		fn = returnType;
		returnType = ref;
	}
	if (typeof fn !== 'function') {
		throw new Error('First argument must be a function');
	}
	if (typeof returnType == 'function' && returnType.type instanceof Type) returnType = returnType.type;
	const requiredArguments = Array.isArray(argumentsTypes) ? argumentsTypes.filter(i => Array.isArray(i) ? !i.includes(null) : true) : [];
	const wrappedFn = function(...args){
		if(argumentsTypes && Array.isArray(argumentsTypes)){
			if(args.length !== requiredArguments.length && args.length !== argumentsTypes.length){
				throw new TypeError(`Function ${fn.name || '<anonymous>'} takes exactly ${requiredArguments.length} parameters`)
			}	
			const argumentsTyped = typeAre(args, argumentsTypes);
			if(argumentsTyped !== false){
				throw new TypeError(`Function ${fn.name || '<anonymous>'} call error: Parameter at index ${argumentsTyped} is of the wrong type`);
			}
		}
		const result = fn.call(this, ...args);
		if(!typeis(result, wrappedFn.returnType)){
			throw new TypeError(`Function ${fn.name || '<anonymous>'} does not return it's own return type.`);
		}
		return result;
	}
	wrappedFn.returnType = returnType;
	wrappedFn.type = returnType;
	wrappedFn.argumentsTypes = argumentsTypes;
	return wrappedFn;
}
typef.is = function(func, returnType, argumentsTypes){
	return typeis(func.returnType.defaultValue, returnType);
}

const typeAre = (values, types) => {
	const verified = values.map((t, i) => Array.isArray(types[i]) ? (types[i].map((t2) => typeis(t, t2)).includes(true)) : typeis(t, types[i]));
	const hasWrong = verified.indexOf(false);
	return hasWrong > -1 ? hasWrong : false;
}

function typeis(obj, typeDef, missingObjects = false) {

	
	if(Array.isArray(typeDef)){
		return typeDef.some((item) => typeis(obj, item));
	}

	if(obj == null && typeDef === null) return true;
	else if(obj == null) return false;
	if(obj == undefined && typeDef === undefined) return true;
	else if(obj == undefined) return false;

	if(typeDef == null && obj === null) return true;
	else if(typeDef == null) return false;
	if(typeDef == undefined && obj === undefined) return true;
	else if(typeDef == undefined) return false;


	// Resolve Type
	if (typeof typeDef == 'function' && typeDef.type instanceof Type) typeDef = typeDef.type;
	else if(typeof obj == "object" && typeof typeDef == "function" && obj instanceof typeDef) return true;

	if (typeDef.isConstructed && typeDef.class && !(obj instanceof typeDef.class)) {
		return missingObjects ? [false] : false;
	}

	if (getType(obj) == 'object' && typeDef.type == 'function') {
		return missingObjects ? [obj instanceof typeDef.class] : obj instanceof typeDef.class;
	}

	if (getType(obj) !== typeDef.type) {
		return missingObjects ? [false] : false;
	}

	if (!typeDef.isEmpty) {
		if (typeDef.type == 'object') {
			for (const key in typeDef.defaultValue) {
				let propTypeDef = typeDef.defaultValue[key];
				// Resolve type
				if (typeof propTypeDef == 'function' && propTypeDef.type) propTypeDef = propTypeDef.type;

				if (typeof propTypeDef === 'object') {
					if (!typeis(obj[key], propTypeDef)) {
						return missingObjects ? [false, {
							[key]: {
								type_mismatch: propTypeDef,
								given: obj[gen_key]
							}
						}] : false;
					}
				} else if (typeof obj[key] !== typeof propTypeDef) {
					return missingObjects ? [false, {
						[key]: obj[key] ? {
							type_mismatch: typeof propTypeDef,
							given: typeof obj[key]
						} : {
							not_found: true
						}
					}] : false;
				}
			}
			if (typeDef.strict) {
				if (Object.keys(obj).some((key) => !Object.keys(typeDef.defaultValue).includes(key))) return missingObjects ?
					[false, Object.fromEntries(Object.keys(obj).filter((key) => !Object.keys(typeDef.defaultValue).includes(key)).map((key) => [key, { is_extra: true }]))]
				: false;
			}
		} else if (typeDef.type == 'string') {
			return typeDef.defaultValue == obj;
		} else if (typeDef.type == 'function') {
			return typeDef.defaultValue == obj;
		}
	}

	return missingObjects ? [true] : true;
}
typeis.multi = (values, types) => typeAre(values, types);

function typex(child, parent) {
	return child.prototype instanceof parent || child === parent;
}

function typei(child, parent) {
	return child instanceof parent || child.constructor === parent;
}

const _supportsFor = (item) => {
	item.or = (...others) => [item, ...others]
}
function int(str) {
	return parseInt(str);
}
int.type = typedef(1);
_supportsFor(int);

function float(str) {
	return parseFloat(str);
}
float.type = typedef(1.0);
_supportsFor(float);

function num(str) {
	return Number(str);
}
_supportsFor(num);
num.type = typedef(1);

function str(str) {
	return str ? str.toString() : '';
}
str.type = typedef('');
_supportsFor(str);

function bool(value) {
	return typeof value == 'string' ? (value == 'true' ? true : false) : value !== null && value !== undefined;
}
bool.type = typedef(true);
_supportsFor(bool);

const SerializableData = ['string', 'number', 'boolean'];
const isRegExp = (obj) => Object.prototype.toString.call(obj) === '[object RegExp]';
const AnySymbol = Symbol('any');
const ExistsSymbol = Symbol('exists');

function deepMatch(obj, pattern) {

	if (pattern instanceof RegExp && typeof obj === 'string') {
		return pattern.test(obj);
	}

	if (typeis(obj, pattern)) {
		return true;
	}

	if (pattern === null || obj === null) return pattern === obj;
	if (typeof pattern !== 'object' || typeof obj !== 'object') return pattern === obj;


	for (const key of Object.keys(pattern)) {
		const expected = pattern[key];

		if (!(key in obj)) {
			if (expected === ExistsSymbol) continue; // allow ExistsSymbol to pass if key is missing
			return false;
		}

		const actual = obj[key];

		if (expected === ExistsSymbol) {
			// Just existence check
			continue;
		} else if (Array.isArray(expected)) {
			// Match if actual matches any of the values
			if (!expected.some(val => deepMatch(actual, val))) return false;
		} else if (!deepMatch(actual, expected)) {
			return false;
		}
	}

	return true;
}

function fixArray(arr) {
	let result = [];
	for (let i = 0; i < arr.length; i += 2) {
		const key = arr[i];
		const value = arr[i + 1];
		if (Array.isArray(key)) {
			for (let k of key) result.push([k, value]);
		} else {
			result.push([key, value]);
		}
	}
	return result;
}

function _raw_match(value, templates, props) {
	const entries = templates instanceof Map
		? templates.entries()
		: Array.isArray(templates)
			? fixArray(templates)
			: Object.entries(templates);

	let any = null;

	for (const [pattern, callback] of entries) {
		let matched = false;

		if (pattern === AnySymbol) {
			any = callback;
			continue;
		}

		if (typeof pattern === 'function') {
			matched = value instanceof pattern || pattern(value);
		} else if(pattern instanceof Struct) {
			matched =  value['@instance'] == pattern;
		} else if (isRegExp(pattern)) {
			matched = pattern.test(value);
		} else if (SerializableData.includes(typeof value)) {
			matched = pattern === value;
		} else if (typeof pattern === 'object') {
			matched = deepMatch(value, pattern);
		}

		if (matched && props) {
			if (typeof props === 'object') {
				matched = deepMatch(value, props);
			} else if (typeof props === 'function') {
				matched = props(pattern, value);
			}
		}

		if (matched) {
			return callback(...(isRegExp(pattern) ? pattern.exec(value) : [value]));
		}
	}

	if (any) {
		return any(value);
	}

	return null;
}

function match(value, props) {
	let templates = [];
	return {
		on(_case, fn) {
			templates.push(_case, fn);
			return this;
		},
		default(fn) {
			templates.push(AnySymbol, fn);
			return this;
		},
		get end() {
			return _raw_match(value, templates, props);
		}
	};
}


match.prototype.any = AnySymbol
match.prototype.exists = ExistsSymbol

function map(...args) {
	if (args.length % 2 !== 0) {
		throw new Error('Arguments must be in key-value pairs');
	}

	const result = new Map();
	for (let i = 0; i < args.length; i += 2) {
		const key = args[i];
		const value = args[i + 1];
		// rew.prototype.io.prototype.out.print(key, value);
		result.set(key, value);
	}

	return result;
};

Object.without = function(object, ...keys){
	let newObject = {...object};
	for(let i = 0; i < keys.length; i++){
		delete newObject[keys[i]];
	}
	return newObject;
}

class Struct {
	#template = {};
	#types = {};
	constructor(a, t){
		this.#template = a;
		this.#types = t;
	}

	validate(properties){
		let instance = {};
		for (let key in this.#template) {
			let defaultValue = this.#template[key];
			if(key.startsWith('@') && typeof this.#template[key] == "function"){
				const realname = key.slice(1);
				instance[realname] = defaultValue(properties[realname]);
			} else if (key in properties) {
				let value = properties[key];
				if (defaultValue != '!any' && typeof value !== this.#types[key] && this.#types[key] !== '!any' && !typeis(value, this.#types[key])) {
					return [false, (this.#types[key]?.type?.type ?? this.#types[key]), key, typeof value];
				}
				instance[key] = value;
			} else {
				instance[key] = defaultValue == '!any' ? null : defaultValue?.type instanceof Type ? defaultValue.type.defaultValue : defaultValue;
			}
		}
		return instance;
	}

}
function struct(template) {
	var key, types, value;

	types = {};
	for (key in template) {
		value = template[key];
		types[key] = typeof template[key] == 'function' && template[key].type instanceof Type ? template[key] : typeof value;
	}

	let s = new Struct(template, types);
	s.prototype = {};
	s.prototype.extends = (stuff) => struct({ ...template, ...stuff });
	s.prototype.new = function StructFactory(properties, extra){
		var instance = s.validate(properties);
		if(instance?.[0] == false){
			throw new Error(`Type error: Expected ${instance[1]} for ${instance[2]}, got ${instance[3]}`);
		}
		if(typeof extra == "object"){
			for(let i in extra){
				instance[i] = extra[i];
			}
		}
		instance.__proto__ = { '@instance': s };
		return instance;
	}
	return s;
};


function macro(_, _fn){
  return function(name, ...args){
    let fn = args.pop()
    let full_args = args.length == 1 && args[0] == null ? [] : args;
    return _fn(name, fn, ...full_args);
	};
}

function proto(name, ...args){
	let _strict = false;
	let fn = args.pop()
	let full_args = args.length == 1 && args[0] == null ? [] : args;
	full_args = full_args.filter(i => {
		if(i == "strict"){
			_strict = true;
			return false;
		} else return true;
	});
	let parameter_types = !full_args.length ? [[], undefined] :
		full_args.length == 1 ? [[], full_args[0]] :
		[
			Array.isArray(full_args[0]) ? full_args[0] : [full_args[0]],
			full_args[1]
		];
	return function(...args){
		const checked_args = args.map((arg, index) => {
			// rew.prototype.io.prototype.out.print("ARGS", arg, parameter_types[0]);
			if(typeis(arg, parameter_types[0][index])){
				return arg;
			} else if(_strict){
				throw new TypeError(`Argument for function ${name || '<anonymous>'} at index ${index} is of the wrong type.`);
			} else if(typeof parameter_types[0][index] == "function"){
				return parameter_types[0][index](arg);
			}
			return arg;
		});
		const result = fn.call(this, ...checked_args);
		if(typeis(result, parameter_types[1])){
			return result;
		} else if(_strict){
			throw new TypeError(`Function ${name || '<anonymous>'} returned the wrong type.`);
		} else if(typeof parameter_types[1] == "function"){
			return parameter_types[1](result);
		}
		return result;
	}
}
proto.strict = (name, ...a) => proto(name, "strict", ...a);

if(!rew.extensions.has('types')) rew.extensions.add('types', () => rew.extensions.createClass({
	_namespace(){
		return this;
	},
	typex,
	typei,
	typeis,
	typedef,
	typef,
	match,
	map,
	int,
	float,
	num,
	str,
	bool,
	struct,
	macro,
	proto
}));
})({filename: "#std.types"});(function(module){
"no-compile"
if(!rew.extensions.has('conf')) rew.extensions.add('conf', (Deno, module) => rew.extensions.createClass({
  _namespace(){
    return "conf";
  },

  read(key) {
    return rew.ops.op_data_read(this.current_app.config.manifest.package, key);
  },

  path(){
    return rew.ops.op_data_get_path(this.current_app.config.manifest.package);
  },
  
  async write(key, content) {
    if (typeof content !== 'string') {
      content = JSON.stringify(content);
    }
    return await rew.ops.op_data_write(this.current_app.config.manifest.package, key, content);
  },
  
  async delete(key) {
    return await rew.ops.op_data_delete(this.current_app.config.manifest.package, key);
  },
  
  exists(key) {
    return rew.ops.op_data_exists(this.current_app.config.manifest.package, key);
  },
  
  list(prefix = '') {
    const result = rew.ops.op_data_list(this.current_app.config.manifest.package, prefix);
    return JSON.parse(result);
  },
  
  readJSON(key) {
    const content = this.read(key);
    return JSON.parse(content);
  },
  
  async writeJSON(key, data) {
    return await this.write(key, JSON.stringify(data, null, 2));
  },

  readYAML(key) {
    return rew.ops.op_data_read_yaml(this.current_app.config.manifest.package, key);
  },
  
  async writeYAML(key, data) {
    return await rew.ops.op_data_write_yaml(this.current_app.config.manifest.package, key, data);
  },
  
  readBinary(key) {
    const data = rew.ops.op_data_read_binary(this.current_app.config.manifest.package, key);
    return new Uint8Array(data);
  },
  
  async writeBinary(key, data) {
    const arrayData = data instanceof Uint8Array ? Array.from(data) : data;
    return await rew.ops.op_data_write_binary(this.current_app.config.manifest.package, key, arrayData);
  },
  
  readAuto(key) {
    const [exists, format] = rew.ops.op_data_get_info(this.current_app.config.manifest.package, key);
    
    if (!exists) {
      throw new Error("File not found: #{key}");
    }
    
    switch (format) {
      case 'json':
        return this.readJSON(key);
      case 'yaml':
        return this.readYAML(key);
      case 'binary':
        return this.readBinary(key);
      case 'text':
      default:
        return this.read(key);
    }
  },
  
  async writeAuto(key, data) {
    // Determine format based on file extension
    const ext = key.split('.').pop().toLowerCase();
    
    if (data instanceof Uint8Array || Array.isArray(data) && data.every(item => typeof item === 'number' && item >= 0 && item <= 255)) {
      return await this.writeBinary(key, data);
    } else if (typeof data === 'object') {
      if (ext === 'yaml' || ext === 'yml') {
        return await this.writeYAML(key, data);
      } else {
        return await this.writeJSON(key, data);
      }
    } else {
      return await this.write(key, String(data));
    }
  },
  
  getInfo(key) {
    const [exists, format] = rew.ops.op_data_get_info(this.current_app.config.manifest.package, key);
    return { exists, format };
  },

  current_app: module.app || { config: {}, path: "" },
}));

})({filename: "#std.conf"});(function(module){
"no-compile"
if(!rew.extensions.has('encoding')) rew.extensions.add('encoding', (Deno, module) => rew.extensions.createClass({
  _namespace(){
    return {
      ...this,
      toBytes: (string) => {
        return this.stringToBytes(string);
      },
      strBytes: (bytes) => {
        return this.bytesToString(bytes);
      }
    };
  },
  toBase64(data) {
    if (data instanceof Uint8Array) {
      return rew.ops.op_to_base64(Array.from(data));
    }
    return rew.ops.op_to_base64(data);
  },
  
  fromBase64(encoded, options = { asString: false }) {
    const result = rew.ops.op_from_base64(encoded, { as_string: options.asString });
    if (!options.asString) {
      return new Uint8Array(result);
    }
    return result;
  },
  
  stringToBytes(str) {
    return Deno.core.encode(str);
  },
  
  bytesToString(bytes) {
    return Deno.core.decode(bytes);
  },
  
  encodeURIComponent(str) {
    return encodeURIComponent(str);
  },
  
  decodeURIComponent(str) {
    return decodeURIComponent(str);
  },
  
  bytesToHex(bytes) {
    if (!(bytes instanceof Uint8Array)) {
      throw new Error("Expected Uint8Array");
    }
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  },
  
  hexToBytes(hex) {
    if (typeof hex !== 'string') {
      throw new Error("Expected string");
    }
    
    hex = hex.startsWith('0x') ? hex.slice(2) : hex;
    
    if (hex.length % 2 !== 0) {
      hex = '0' + hex;
    }
    
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    
    return bytes;
  }
}));
})({filename: "#std.encoding"});(function(module){
"no-compile"

function trackPromise(promise){
  return Promise.resolve(promise);
}

if(!rew.extensions.has('fs')) rew.extensions.add('fs', (Deno, module) => rew.extensions.createClass({
  _namespace(){
    return this;
  },

  ...Deno.fs,

  open(path, options){
    const a = path.startsWith('/') ? path : rew.prototype._path.prototype.resolveFrom(module.filename, path);
    return Deno.fs.open(a, options);
  },

  read(path, options = { binary: false }) {
    const result = rew.ops.op_fs_read(module.filename, path, options);
    if (options.binary) {
      return new Uint8Array(result);
    }
    return result;
  },
  
  async write(path, content, options = { binary: false, create_dirs: false }) {
    if (options.binary && content instanceof Uint8Array) {
      content = Array.from(content);
    }
    return await rew.ops.op_fs_write(module.filename, path, content, options);
  },
  
  async readBinary(path) {
    return await this.read(path, { binary: true });
  },
  
  async writeBinary(path, data) {
    return await this.write(path, data, { binary: true, create_dirs: true });
  },
  
  stringToBytes(str) {
    const encoder = new TextEncoder();
    return encoder.encode(str);
  },
  
  bytesToString(bytes) {
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
  },
 
  sha(path) {
    return rew.ops.op_fs_sha(module.filename, path);
  },

  exists(path) {
    return rew.ops.op_fs_exists(module.filename, path);
  },
  
  async rm(path, recursive = false) {
    return trackPromise(rew.ops.op_fs_rm(module.filename, path, {recursive}));
  },
  
  stats(path) {
    const statsJson = rew.ops.op_fs_stats(module.filename, path);
    return JSON.parse(statsJson);
  },
  
  async mkdir(path, recursive = false) {
    return trackPromise(rew.ops.op_fs_mkdir(module.filename, path, {recursive}));
  },
  
  readdir(path, options = { include_hidden: true, filter_type: null, sort_by: null }) {
    const entriesJson = rew.ops.op_fs_readdir(module.filename, path, options);
    return JSON.parse(entriesJson);
  },
  
  async copy(src, dest, options = {
    recursive: true,
    create_dirs: true,
    overwrite: false,
  }) {
    return trackPromise(rew.ops.op_fs_copy(module.filename, src, dest, options));
  },
  
  async rename(src, dest) {
    return trackPromise(rew.ops.op_fs_rename(module.filename, src, dest));
  },
  
  async ensureDir(path) {
    return await this.mkdir(path, { recursive: true });
  },
  
  async rmrf(path) {
    return await this.rm(path, { recursive: true });
  },
  
  isDirectory(path) {
    try {
      const stats = this.stats(path);
      return stats.isDirectory;
    } catch (e) {
      return false;
    }
  },
  
  isFile(path) {
    try {
      const stats = this.stats(path);
      return stats.isFile;
    } catch (e) {
      return false;
    }
  }
}));

})({filename: "#std.fs"});(function(module){
"no-compile"
if(!rew.extensions.has('os')) rew.extensions.add('os', (Deno) => rew.extensions.createClass({
  slug: Deno.core.ops.op_os_info_os(),
  arch: Deno.core.ops.op_os_info_arch(),
  family: Deno.core.ops.op_os_info_family(),
  release: Deno.os.osRelease(),
  get loadavg(){
    return Deno.os.loadavg()
  },
  get uptime(){
    return Deno.os.osUptime()
  },
  get hostname(){
    return Deno.os.hostname()
  },
  mem: () => Deno.os.systemMemoryInfo(),
  networkInterfaces: () => Deno.os.networkInterfaces(),
  get homeDir(){
    return rew.prototype.env.prototype.get("HOME") || rew.prototype.env.prototype.get("USERPROFILE")
  },
  get tempDir(){
    return rew.prototype.env.prototype.get("TMPDIR") || rew.prototype.env.prototype.get("TEMP")
  },
  userInfo: () => ({
    username: rew.prototype.env.prototype.get("USER") || rew.prototype.env.prototype.get("USERNAME"),
    uid: Deno.os.uid(),
    gid: Deno.os.gid(),
  })
}));
})({filename: "#std.os"});(function(module){
"no-compile"
if(!rew.extensions.has('path')) rew.extensions.add('path', (Deno, module) => rew.extensions.createClass({
  _namespace(){
    return 'path';
  },
  resolveFrom(base, relative) {
    return rew.prototype._path.prototype.resolveFrom(base, relative);
  },
  resolve(...paths){
    const path = this.join(...paths);
    return this.resolveFrom(module.filename, path);
  },
  choose(...paths) {
    return paths
      .map(p => p.startsWith('/') ? p : this.resolve(p))
      .find(p => rew.ops.op_fs_exists(module.filename, p)) || null;
  },
  join(...segments) {
    let segment_root = segments.find(segment => segment.startsWith('/'));
    return segments.indexOf(segment_root) > 0 ? segment_root : segments
      .map((segment) => segment.replace(/\/+$/, '')) // Remove trailing slashes
      .join('/')
      .replace(/\/+/g, '/'); // Normalize multiple slashes
  },
  normalize(path) {
    const parts = path.split('/');
    const normalized = [];

    for (const part of parts) {
      if (part === '.' || part === '') continue;
      if (part === '..') normalized.pop();
      else normalized.push(part);
    }

    let np = normalized.join('/');
    return np.startsWith('/') ? np : '/' + np;
  },
  dirname(path) {
    const parts = path.split('/');
    parts.pop();
    return parts.join('/') || '/';
  },
  basename(path) {
    const parts = path.split('/');
    return parts.pop() || '';
  },
  extname(path) {
    const base = this.basename(path);
    const index = base.lastIndexOf('.');
    return index > 0 ? base.slice(index) : '';
  },
  isAbsolute(path) {
    return path.startsWith('/');
  },
  relative(from, to) {
    const fromParts = this.resolve('/', from).split('/');
    const toParts = this.resolve('/', to).split('/');
    while (fromParts.length && toParts.length && fromParts[0] === toParts[0]) {
      fromParts.shift();
      toParts.shift();
    }
    return '../'.repeat(fromParts.length - 1) + toParts.join('/');
  },
}));
})({filename: "#std.path"});(function(module){
"no-compile"
class ExecPipedError extends Error {
  constructor(message) {
    super(message);
    this.name = "ExecPipedError";
  }
}
if(!rew.extensions.has('shell')) rew.extensions.add('shell', (Deno) => rew.extensions.createClass({
  _namespace(){
    return 'shell';
  },
  get ChildProcess(){
    return Deno.ChildProcess;
  },
  kill(pid, signal = "SIGTERM") {
    Deno.kill(pid, signal);
  },
  spawn(command, options = {}) {
    return Deno.run({
      cmd: Array.isArray(command) ? command : command.split(" "),
      ...options,
    });
  },
  async wait(process) {
    const status = await process.status();
    process.close();
    return status;
  },
  fexec(command, options = {}) {
    const process = this.spawn(command, { ...options, stdout: "piped", stderr: "piped" });
    return this.wait(process).then((status) => {
      return {
        status,
        output: process.output(),
        error: process.stderrOutput(),
      };
    });
  },
  sync(command, options = {}){
    return this.exec(command, { ...options, stdout: "piped", stderr: "piped" });
  },
  command(command, options = {}) {
    if (typeof command === "string") {
      command = command.split(" ");
    }
    return new Deno.Command(command[0], {
      args: command.slice(1),
      stdin: "inherit",
      stdout: "inherit",
      stderr: "inherit",
      ...options,
    });
  },
  exec(command, options = {}) {
    let commands = Array.isArray(command) ? command : command.split(" ");
    let { onlyString } = options; 
    delete options.onlyString; 
    const cmd = new Deno.Command(commands.shift(), {
      stdin: "inherit",
      stdout: "inherit",
      ...options,
      args: commands,
    });
    if(!onlyString) return cmd.outputSync();
    if(options.stdout === "inherit" || !options.stdout) {
      return Deno.core.decode(cmd.outputSync().stdout);
    } else {
      const { success, code, stdout, stderr } = cmd.outputSync();
      if (!success) {
        throw new ExecPipedError(`Command failed with exit code ${code}: ${Deno.core.decode(stderr)}`);
      }
      return Deno.core.decode(stdout);
    }
  }
}));
})({filename: "#std.shell"});(function(module){
"no-compile"
const liveThreads = [];
if(!rew.extensions.has('threads')) rew.extensions.add('threads', (Deno, module) => rew.extensions.createClass({
  _namespace(){
    return "threads";
  },

  spawn(code) {
    if (typeof code === 'function') {
      code = `(${code.toString()})();`;
    }
    
    const id = rew.ops.op_thread_spawn(code);
    liveThreads.push(id);
    return id;
  },

  list(){
    return liveThreads;
  },

  terminate(...ids) {
    return ids.map((id) => {
      liveThreads.splice(liveThreads.indexOf(id), 1);
      rew.ops.op_thread_terminate(id);
    });
  },
  
  create(code) {
    const threadId = this.spawn(code);
    
    return {
      id: threadId,
      
      postMessage(message) {
        return rew.ops.op_thread_message(this.id, JSON.stringify(message));
      },
      
      terminate() {
        this._polling = false;
        liveThreads.splice(liveThreads.indexOf(this.id), 1);
        return rew.ops.op_thread_terminate(this.id);
      },
      
      receiveMessage(timeout) {
        if(!liveThreads.includes(this.id)) return null;
        return rew.ops.op_thread_receive(this.id, timeout);
      },
      
      _startPolling() {
        if (!this._polling && this._onmessage) {
          this._polling = true;
          
          const poll = () => {
            if (!this._polling) return;
            
            const message = this.receiveMessage(100);
            if (message) {
              this._onmessage({ data: message });
            }
            
            setTimeout(poll, 10);
          };
          
          poll();
        }
      },
      
      onmessage(fn) {
        this._onmessage = fn;
        if (fn) {
          this._polling = false;
          this._startPolling();
        } else {
          this._polling = false;
        }
      }

    };
  }
}));
})({filename: "#std.threads"});(function(module){
"no-compile"
if(!rew.extensions.has('http')) rew.extensions.add('http', (Deno, module) => rew.extensions.createClass({
  serveSimple(options, handler) {
    return Deno.serve(options, handler);
  },
  withOptions(options) {
    return (handler) => Deno.serve(options, handler);
  },
  serveHttp: Deno.serveHttp,
  Response: class extends Deno.Response {
    new(body, init) {
      return new Deno.Response(body, init);
    }
  },
  Request: class extends Deno.Request {
    new(input, init) {
      return new Deno.Request(input, init);
    }
  },
  upgradeWebSocket: Deno.upgradeWebSocket,
}));
})({filename: "#std.http"});(function(module){
"no-compile"
if(!rew.extensions.has('yaml')) rew.extensions.add('yaml', (Deno, module) => rew.extensions.createClass({
  parse(string){
    return Deno.core.ops.op_string_to_yaml(string);
  },
  string(yaml){
    return Deno.core.ops.op_yaml_to_string(yaml);
  },
})); 
})({filename: "#std.yaml"});rew.prototype.mod.prototype.defineNew("/home/makano/workspace/pimmy/features/loader/main.coffee", {
"/home/makano/workspace/pimmy/features/loader/main.coffee"(globalThis){
with (globalThis) {
  rew.prototype.mod.prototype.package("pimmy::loader");

loader.prototype.frames = ['|', '/', '-', '\\']
loader.prototype.interval = null
loader.prototype.i = 0
loader.prototype.text = 'Loading'

loader.prototype.start = function(text) {
  if (text) loader.prototype.text = text
  if (loader.prototype.interval != null) { return }  // avoid duplicate intervals

  return this.interval = setInterval(() => {
    let frame = loader.prototype.frames[loader.prototype.i % loader.prototype.frames.length]
    printf(`\r${frame} ${loader.prototype.text}`)
    return loader.prototype.i++
  }
  , 100)
}

loader.prototype.say = function(newText) {
  return loader.prototype.text = newText
}

loader.prototype.stop = function() {
  if (!(loader.prototype.interval != null)) { return }
  clearInterval(loader.prototype.interval)
  loader.prototype.interval = null
  return printf("\r")
}

}
return globalThis.module.exports;
}          
}, ["app://rew.pimmy/features/loader/main"]);rew.prototype.mod.prototype.defineNew("/home/makano/workspace/pimmy/features/logger/main.coffee", {
"/home/makano/workspace/pimmy/features/logger/main.coffee"(globalThis){
with (globalThis) {
  rew.prototype.mod.prototype.package("pimmy::logger");


this.black     = (t) => `\x1b[30m${t}\x1b[0m`
this.red       = (t) => `\x1b[31m${t}\x1b[0m`
this.green     = (t) => `\x1b[32m${t}\x1b[0m`
this.yellow    = (t) => `\x1b[33m${t}\x1b[0m`
this.blue      = (t) => `\x1b[34m${t}\x1b[0m`
this.magenta   = (t) => `\x1b[35m${t}\x1b[0m`
this.cyan      = (t) => `\x1b[36m${t}\x1b[0m`
this.white     = (t) => `\x1b[37m${t}\x1b[0m`
this.gray      = (t) => `\x1b[90m${t}\x1b[0m`

this.bgRed     = (t) => `\x1b[41m${t}\x1b[0m`
this.bgGreen   = (t) => `\x1b[42m${t}\x1b[0m`
this.bgYellow  = (t) => `\x1b[43m${t}\x1b[0m`
this.bgBlue    = (t) => `\x1b[44m${t}\x1b[0m`
this.bgMagenta = (t) => `\x1b[45m${t}\x1b[0m`
this.bgCyan    = (t) => `\x1b[46m${t}\x1b[0m`
this.bgWhite   = (t) => `\x1b[47m${t}\x1b[0m`
this.bgGray    = (t) => `\x1b[100m${t}\x1b[0m`

this.bold      = (t) => `\x1b[1m${t}\x1b[22m`
this.dim       = (t) => `\x1b[2m${t}\x1b[22m`
this.italic    = (t) => `\x1b[3m${t}\x1b[23m`
this.underline = (t) => `\x1b[4m${t}\x1b[24m`
this.inverse   = (t) => `\x1b[7m${t}\x1b[27m`
this.hidden    = (t) => `\x1b[8m${t}\x1b[28m`
this.strike    = (t) => `\x1b[9m${t}\x1b[29m`

this.normal    = (t) => `\x1b[0m${t}\x1b[0m`

let symbols =  {
  info: "",
  types: '',
  warn: "",
  file: "",
  err: "",
  suc: "",
  question: "",
  "package": "",
  git: "󰊢",
  github: "",
  download: "",
  build: "",
  terminal: "",
}

let startPrefix      = '╭'
let separator        = '│'
let middlePrefix     = '├'
let endPrefix        = '╰'

pimmy.prototype.logger.prototype.LOG = false;
let printnorm = function(logs) {
  print(gray(separator))
  return print(gray(middlePrefix) + " " + logs)
}

let parse_log = (log) => {
  if (log.startsWith('!')) {
    return log.slice(1, -1)
  }
  else if (log.startsWith(':icon')) {
    let colors = log.split(' ')
    colors.shift();
    let icon = symbols[colors.shift()]
    if (colors.length) {
      for (const color of colors) {
        icon = this[color.trim()](icon)
      }
    }
    return icon
  }
  else if (log.startsWith('@')) {
    let names = log.slice(1, -1).split('(')[0].split(',')
    let all = log.split('(')[1].split(')')[0]
    
    for (const name of names) {
      all = this[name](all)
    }
    return all
  }
  else {
    return log
  }
}

let resolve_logs = function(logs) {
  return logs.map(parse_log).join(' ')
}

pimmy.prototype.logger.prototype.title = (...logs) => {
  print()
  return print(gray(startPrefix) + " " + resolve_logs(logs))
}

pimmy.prototype.logger.prototype.closeTitle = (...logs) => {
  print(gray(separator))
  return print(gray(endPrefix) + " " + resolve_logs(logs))
}

pimmy.prototype.logger.prototype.subtitle = (...logs) => {
  return print(gray(separator) + " " + resolve_logs(logs))
}

pimmy.prototype.logger.prototype.verbose = (...logs) => {
  if (pimmy.prototype.logger.prototype.LOG) {
    return printnorm(bold(gray(symbols.terminal)) + " " + resolve_logs(logs))
  };return
}

pimmy.prototype.logger.prototype.log = (...logs) => {
  return printnorm(resolve_logs(logs))
}

pimmy.prototype.logger.prototype.info = (...logs) => {
  return printnorm(blue(symbols.info) + ' ' + resolve_logs(logs))
}

pimmy.prototype.logger.prototype.error = (...logs) => {
  return printnorm(bgRed(' ' + black(symbols.err + ' ERROR ')) + ' ' + red(resolve_logs(logs)))
}

pimmy.prototype.logger.prototype.warn = (...logs) => {
  return printnorm(bgYellow(' ' + black(symbols.warn + ' WARN ')) + ' ' + yellow(resolve_logs(logs)))
}

pimmy.prototype.logger.prototype.input = (icon, ...logs) => {
  if (!logs.length) {
    logs = [icon]
    icon = blue(symbols.question)
  }
  if (icon.startsWith(':icon')) {
    icon = resolve_logs([icon])
  }
  print(gray(separator))
  let after_prefix =  " " + icon + " " + resolve_logs(logs) + " ";
  let result = input(gray(endPrefix) + after_prefix)
  print("\x1b[1A\r" + gray(middlePrefix) + after_prefix)
  return result
}


let loader_frames = [
  '⠋',
  '⠙',
  '⠸',
  '⠴',
  '⠦',
  '⠇'
]
let loader_interval = null
let loader_i = 0
let loader_text = 'Loading'

let _loader_frames = () => {
  let frame = loader_frames[loader_i % loader_frames.length]
  printf(`\r${gray(endPrefix)} ${pickRandom(cyan, red, blue, yellow, magenta)(frame)} ${loader_text}`)
  return loader_i++
}

let loader_start = function(text) {
  print(gray(separator))
  if (text) loader_text = text
  if (loader_interval != null) { return }

  return loader_interval = setInterval(_loader_frames, 100)
}

let loader_say = function(newText) {
  return loader_text = newText
}

let loader_stop = function() {
  if (!(loader_interval != null)) { return }
  clearInterval(loader_interval)
  loader_interval = null
  return printf("\x1b[1A\r")
}

pimmy.prototype.logger.prototype.loading = loader_start 
pimmy.prototype.logger.prototype.setLoadeg = loader_say
pimmy.prototype.logger.prototype.stopLoading = loader_stop

pimmy.prototype.logger.prototype.indent = function(x = 1) { return `\r${gray(middlePrefix+'─'.repeat(x))}` }
}
return globalThis.module.exports;
}          
}, ["app://rew.pimmy/features/logger/main"]);rew.prototype.mod.prototype.defineNew("/home/makano/workspace/pimmy/features/utils/main.coffee", {
"/home/makano/workspace/pimmy/features/utils/main.coffee"(globalThis){
with (globalThis) {
  rew.prototype.mod.prototype.package("pimmy::utils");
rew.prototype.mod.prototype.find(module, "#std.fs");
rew.prototype.mod.prototype.find(module, "#std.yaml");

pimmy.prototype.utils.prototype.readYaml = function(path) {
  return rew.prototype.yaml.prototype.parse(read(path))
}

pimmy.prototype.utils.prototype.resolveGithubURL = function(github_url) {
  let match = github_url.match(/^github:([^\/]+)\/([^@#]+)(?:@([^#]+))?(?:#(.+))?$/)
  if (!match) {
    pimmy.prototype.logger.prototype.error(`Invalid GitHub URL: ${github_url}`)
    return null
  }

  let owner, repoName, branch, commit;

  [, owner, repoName, branch, commit] = match
  branch = branch ?? "main"

  let baseUrl = `https://raw.githubusercontent.com/${owner}/${repoName}/${branch}/`
  let homeUrl = `https://github.com/${owner}/${repoName}`
  return ({baseUrl, homeUrl, owner, repoName, branch, commit})
}

}
return globalThis.module.exports;
}          
}, ["app://rew.pimmy/features/utils/main"]);rew.prototype.mod.prototype.defineNew("/home/makano/workspace/pimmy/features/init/main.coffee", {
"/home/makano/workspace/pimmy/features/init/main.coffee"(globalThis){
with (globalThis) {
  rew.prototype.mod.prototype.package("pimmy::init");

rew.prototype.mod.prototype.find(module, "#std!");
rew.prototype.mod.prototype.find(module, "#std.fs");
rew.prototype.mod.prototype.find(module, "#std.path");

pimmy.prototype.init.prototype.ROOT = rew.prototype.env.prototype.get('REW_ROOT');

pimmy.prototype.init.prototype._check_init = function() {
  try {
    let config = rew.prototype.conf.prototype.readAuto("init.yaml")
    return config._init
  }
  catch {
    return false
  }
}

pimmy.prototype.init.prototype._set_init = function() {
  return rew.prototype.conf.prototype.writeAuto('init.yaml', { _init: true })
}

pimmy.prototype.init.prototype._copy_apps = async function() {
  let apps = rew.prototype.fs.prototype.readdir('./apps')
  const results=[];for (const app of apps) {
    let app_path = rew.prototype.path.prototype.normalize(app.path)
    let dest = rew.prototype.path.prototype.join(pimmy.prototype.init.prototype.ROOT, 'apps', app.name)
    results.push(await rew.prototype.fs.prototype.copy(app.path, dest))
  };return results;
}

pimmy.prototype.init.prototype.start = function() {
  if (pimmy.prototype.init.prototype._check_init()) return
  pimmy.prototype.init.prototype._copy_apps()
  pimmy.prototype.init.prototype._set_init()
  return pimmy.prototype.repo.prototype.init()
}
}
return globalThis.module.exports;
}          
}, ["app://rew.pimmy/features/init/main"]);rew.prototype.mod.prototype.defineNew("/home/makano/workspace/pimmy/features/builder/main.coffee", {
"/home/makano/workspace/pimmy/features/builder/main.coffee"(globalThis){
with (globalThis) {
  rew.prototype.mod.prototype.package("pimmy::builder");
rew.prototype.mod.prototype.find(module, "./cargo.coffee");
rew.prototype.mod.prototype.find(module, "./brew.coffee");
using(namespace(pimmy.prototype.builder.prototype.cargo));

pimmy.prototype.builder.prototype.build = async function(app_path_relative, safe_mode) {
  let ref;if (path.prototype.isAbsolute(app_path_relative)) ref = app_path_relative; else ref = rew.prototype.path.prototype.normalize(rew.prototype.path.prototype.join(rew.prototype.process.prototype.cwd, app_path_relative));let app_path = ref
  let app_conf_path = rew.prototype.path.prototype.join(app_path, 'app.yaml')

  if (!rew.prototype.fs.prototype.exists(app_conf_path)) throw new Error('App not found');
  
  let config = pimmy.prototype.utils.prototype.readYaml(app_conf_path)
  pimmy.prototype.logger.prototype.title('Building App', config.manifest.package)
  
  if (!(config.crates || config.build)) throw new Error('no build candidates found');
  
  if (config.cakes) {
    pimmy.prototype.logger.prototype.log('Found Cakes ')
    for (const cakefile of config.cakes) {
      try {
        let cake = await imp(rew.prototype.path.prototype.join(app_path, cakefile))
        if (cake?.builders) {
          for (const key in cake.builders) {
            pimmy.prototype.builder.prototype[key] = cake.builders[key]
          }
        }
        else {
          pimmy.prototype.logger.prototype.warn('Cake did not export any builders')
        }
      }
      catch(e) {
        pimmy.prototype.logger.prototype.log('Failed to load cake')
      }
    }
  }


  let triggers = [];

  let errors = 0

  if (config.crates) {
    if (!cargo.prototype.build_crates_for(app_path, config, safe_mode, triggers)) {
      errors += 1
    }
  }
  
  if (config.build) {
    for (const file of config.build) {
      if (file.using) { 
        let build_fn = pimmy.prototype.builder.prototype[file.using]
        if (!build_fn) {
          pimmy.prototype.logger.prototype.error(`Builder ${file.using} does not exist`)
          errors++
          break
        }
        let input_path = rew.prototype.path.prototype.normalize(rew.prototype.path.prototype.join(app_path, file.input))
        let output_path = rew.prototype.path.prototype.normalize(rew.prototype.path.prototype.join(app_path, file.output))
        if (!exists(input_path)) {
          pimmy.prototype.logger.prototype.error(`Input file ${input_path} not found`)
          errors++
          break
        }
        await build_fn(app_path, config, file, input_path, output_path)
      }
      if (file.id) triggers.filter($ => $.id == file.id)
        .forEach($1 => $1.build())
      if (file.cleanup && !safe_mode) {
        rm(path.prototype.join(app_path, file.cleanup), true)
        pimmy.prototype.logger.prototype.info('File Cleanup')
      }
    }
  }
    
  return pimmy.prototype.logger.prototype.closeTitle(`Finished build with ${errors} errors.`)
}














}
return globalThis.module.exports;
}          
}, ["app://rew.pimmy/features/builder/main"]);rew.prototype.mod.prototype.defineNew("/home/makano/workspace/pimmy/features/builder/cargo.coffee", {
"/home/makano/workspace/pimmy/features/builder/cargo.coffee"(globalThis){
with (globalThis) {
  rew.prototype.mod.prototype.package("pimmy::builder::cargo");

function build_crate(crate, app_path, safe_mode) {
  let crate_path = path.prototype.normalize(path.prototype.join(app_path, crate.path))
  pimmy.prototype.logger.prototype.info(' Building crate', crate.name)
  let result = shell.prototype.exec("cargo build --release", {cwd: crate_path, stdout: 'piped'})
  if (!crate.build) return 1;
  if (!result.success) {
    pimmy.prototype.loader.prototype.stop()
    pimmy.prototype.logger.prototype.error('Failed to build cargo')
    print(rew.prototype.encoding.prototype.bytesToString(result.stderr))
    pimmy.prototype.logger.prototype.error('Cargo build failed')
    return 0
  }
  printf('\x1b[1A\r')
  pimmy.prototype.logger.prototype.info('Built Crate ', crate.name)
  if (crate.files) {
    for (const file of crate.files) {
      copy(path.prototype.join(app_path, file.input), path.prototype.join(app_path, file.output))
      if (file.cleanup) rm(path.prototype.join(app_path, file.cleanup), true)
    }
  }

  if (crate.cleanup && !safe_mode) {
    pimmy.prototype.logger.prototype.info('Clean Up', crate.name)
    rm(path.prototype.join(app_path, crate.cleanup), true)
  }
  return 1
}

cargo.prototype.build_crates_for = function(app_path, app_config, safe_mode, triggers) {
  pimmy.prototype.logger.prototype.log(" Building app crates for", app_config.manifest.package);
  
  for (const crate of app_config.crates) {
    if (crate.trigger) {
      triggers.push({ id: crate.trigger, build: () => build_crate(crate, app_path, safe_mode) })
    }
    else if (!build_crate(crate, app_path, safe_mode)) {
      return 0
    }
  }
  return 1
}




}
return globalThis.module.exports;
}          
}, ["app://rew.pimmy/features/builder/cargo"]);rew.prototype.mod.prototype.defineNew("/home/makano/workspace/pimmy/features/builder/brew.coffee", {
"/home/makano/workspace/pimmy/features/builder/brew.coffee"(globalThis){
with (globalThis) {
  
pimmy.prototype.builder.prototype.brew = function(app_path, config, file) {
  return shell.prototype.exec(`rew brew ${file.input} ${file.output}`, {cwd: app_path})
}

pimmy.prototype.builder.prototype.qrew = function(app_path, config, file) {
  return shell.prototype.exec(`${path.prototype.resolve("./.artifacts/rew-qrew")} ${file.input} ${file.output}`, {cwd: app_path})
}
  

}
return globalThis.module.exports;
}          
}, ["app://rew.pimmy/features/builder/brew"]);rew.prototype.mod.prototype.defineNew("/home/makano/workspace/pimmy/features/cache/main.coffee", {
"/home/makano/workspace/pimmy/features/cache/main.coffee"(globalThis){
with (globalThis) {
  rew.prototype.mod.prototype.package("pimmy::cache");

let _cache_path = path.prototype.join(conf.prototype.path(), 'cache/app-cache')
let _url_pattern = /^file\+([a-zA-Z0-9.]+)(?:\+sha\(([a-fA-F0-9]+)\))?\+(.+)$/;

function renderProgress(downloaded, total) {
  const percent = total ? downloaded / total : 0;
  const barLength = 20;
  const filled = Math.round(barLength * percent);
  const bar = "=".repeat(filled) + "-".repeat(barLength - filled);
  const display = total
    ? `${(percent * 100).toFixed(1)}%`
    : `${(downloaded / 1024).toFixed(1)} KB`;
  printf(`\r Downloading [${bar}] ${display}`);
}

function generate_id_for_existing(app_path) {
  let yml = pimmy.prototype.utils.prototype.readYaml(path.prototype.join(app_path, 'app.yaml'))
  return genUid(
    14,
    yml.manifest.package + (yml.manifest.version || "")
  ) + yml.manifest.package
}

function parse_url_pattern(input) {
  let match = input.match(_url_pattern);
  if (!match) throw new Error("Invalid input format");

  let unarchiver, sha, url;

  [, unarchiver, sha, url] = match;
  return {
    url,
    unarchiver,
    sha: sha || undefined,
  }
}

let unarchivers = null
async function unarchive(unarchiver, input, output) {
  pimmy.prototype.logger.prototype.verbose("Preparing extractors(REW_FFI_LOAD)")
  let symbolMap = instantiate(class {
    zip_unarchive = rew.prototype.ffi.prototype.typed(ffi.prototype.ptr, ffi.prototype.ptr, function() { return 'i32' })
    tar_unarchive = rew.prototype.ffi.prototype.typed(ffi.prototype.ptr, ffi.prototype.ptr, function() { return 'i32' })
    tar_gz_unarchive = rew.prototype.ffi.prototype.typed(ffi.prototype.ptr, ffi.prototype.ptr, function() { return 'i32' })
    tar_xz_unarchive = rew.prototype.ffi.prototype.typed(ffi.prototype.ptr, ffi.prototype.ptr, function() { return 'i32' })
    tar_bz2_unarchive = rew.prototype.ffi.prototype.typed(ffi.prototype.ptr, ffi.prototype.ptr, function() { return 'i32' })
    tar_zst_unarchive = rew.prototype.ffi.prototype.typed(ffi.prototype.ptr, ffi.prototype.ptr, function() { return 'i32' })
    rar_unarchive = rew.prototype.ffi.prototype.typed(ffi.prototype.ptr, ffi.prototype.ptr, function() { return 'i32' })
    sevenz_unarchive = rew.prototype.ffi.prototype.typed(ffi.prototype.ptr, ffi.prototype.ptr, function() { return 'i32' })
  })

  if (!unarchivers) unarchivers = ffi.prototype.open(rew.prototype.path.prototype.resolve("../../.artifacts/libarchiveman.so"), symbolMap)

  return await unarchivers[unarchiver + '_unarchive'](rew.prototype.ptr.prototype.of(
    rew.prototype.encoding.prototype.stringToBytes(input)
  ), rew.prototype.ptr.prototype.of(
    rew.prototype.encoding.prototype.stringToBytes(output)
  ))
}

async function download_file(url, cache_file) {
  let res = await net.prototype.fetch(url)
  const total = Number(res.headers.get("content-length")) || 0
  let downloaded = 0


  let file = await open(cache_file, {
    write: true,
    create: true,
    truncate: true,
  })
  
  let reader = res.body.getReader()
  let writer = file.writable.getWriter()

  while (true) {
    let done, value;
    ({ done, value } = await reader.read())
    if (done) break
    await writer.write(value)
    downloaded = downloaded + value.length
    renderProgress(downloaded, total)
  }
  
  printf("\r\n")
  return file.close()
}

async function build_path(path) {
  return await pimmy.prototype.builder.prototype.build(path)
}

pimmy.prototype.cache.prototype.install = async function(cache_path, update, silent) {
  if (!silent) pimmy.prototype.logger.prototype.title("Installing from cache entry")
  let app_yaml = path.prototype.join(cache_path, 'app.yaml')
  let config = pimmy.prototype.utils.prototype.readYaml(app_yaml)
  let app_name = config.manifest.package

  if (!silent) {
    pimmy.prototype.logger.prototype.log(":icon package", `Package Info for ${app_name}`);
    pimmy.prototype.logger.prototype.log(pimmy.prototype.logger.prototype.indent(), "@gray(version)", `${config.manifest.version || "unknown"}`);
    if (config.manifest.github) {
      pimmy.prototype.logger.prototype.log(pimmy.prototype.logger.prototype.indent(), ":icon github", "github", `${config.manifest.github}`);
    }
    if (config.manifest.description) {
      pimmy.prototype.logger.prototype.log(pimmy.prototype.logger.prototype.indent(), ":icon info", "description", `${config.manifest.description}`);
    }
    if (config.manifest.tags) {
      pimmy.prototype.logger.prototype.log(pimmy.prototype.logger.prototype.indent(), "tags:")
      pimmy.prototype.logger.prototype.log(pimmy.prototype.logger.prototype.indent(2), `!${config.manifest.tags.join(' ')}!`);
    }
    let response = pimmy.prototype.logger.prototype.input("Proceed to install? (y/n)")
    if (!response.toLowerCase().startsWith('y')) {
      pimmy.prototype.logger.prototype.closeTitle("App installation cancelled")
      return
    }
    pimmy.prototype.logger.prototype.log(`Installing ${app_name}`)
  }
  let dest = path.prototype.join(pimmy.prototype.init.prototype.ROOT, 'apps', app_name)

  if (config.dependencies) {
    if (silent) {
      for (const dep of config.dependencies) {
        let cached = await pimmy.prototype.cache.prototype.resolve(dep, true, true, true)
        await pimmy.prototype.cache.prototype.install(cached, true, true, true)
      }
    }
    else {
      pimmy.prototype.logger.prototype.info("Dependencies found")
      for (const dep of config.dependencies) {
        pimmy.prototype.logger.prototype.info(pimmy.prototype.logger.prototype.indent(2), ` ${dep}`)
      }
      let response = pimmy.prototype.logger.prototype.input("Allow install dependencies? (y/n)")
      if (response.toLowerCase().startsWith('y')) {
        for (const dep of config.dependencies) {
          let cached = await pimmy.prototype.cache.prototype.resolve(dep, true, true, true)
          await pimmy.prototype.cache.prototype.install(cached, true, true)
        }
      }
    }
  }

  if (update && exists(dest)) {
    await rm(dest, true)
  }
  await copy(cache_path, dest)
  if (!silent) return pimmy.prototype.logger.prototype.closeTitle("App installed");return
}


pimmy.prototype.cache.prototype.resolve = async function(key, update, isRecursed, silent) {
  if (!isRecursed) pimmy.prototype.logger.prototype.title(`Resolve cache entry ${key}`)
  let app_path = rew.prototype.path.prototype.normalize(path.prototype.join(rew.prototype.process.prototype.cwd, key))
  if (exists(app_path)) {
    let cache_path = path.prototype.join(_cache_path, generate_id_for_existing(app_path))
    if (exists(cache_path)) rm(cache_path, true)
    await copy(app_path, cache_path)
    if (!silent) pimmy.prototype.logger.prototype.closeTitle()
    return cache_path
  }
  else if (_url_pattern.exec(key)) {
    let url, unarchiver, sha;
    ({
      url,
      unarchiver,
      sha
    } = parse_url_pattern(key))
    let uid = genUid(
      24,
      url
    )
    let cache_path = path.prototype.join(_cache_path, uid)
    if (!silent) pimmy.prototype.logger.prototype.info("Found URL entry")
    if (!silent) pimmy.prototype.logger.prototype.verbose(`Downloading URL entry ${url} as cache entry ${uid}`)
    
    mkdir(cache_path, true)

    let cache_file = path.prototype.join(cache_path, `entry.${unarchiver.replaceAll("_", ".")}`)

    if (!update && exists(cache_file)) {
      if (sha) {
        if (rew.prototype.fs.prototype.sha(cache_file) != sha) {
          await download_file(url, cache_file)
        }
        else {
          if (!silent) pimmy.prototype.logger.prototype.verbose("Found Cache skipping Download")
        }
      }
      else {
        if (!silent) pimmy.prototype.logger.prototype.verbose("Found Cache skipping Download")
      }
    }
    else await download_file(url, cache_file)

    let unarachive_path = path.prototype.join(cache_path, "_out")
    let built_path = path.prototype.join(cache_path, "_out/.built")
    if (exists(built_path)) {
      if (!silent) pimmy.prototype.logger.prototype.closeTitle("Cache resolved")
      return unarachive_path
    }
    else mkdir(unarachive_path, true)

    await unarchive(unarchiver, cache_file, unarachive_path)
    let app_yaml = path.prototype.join(unarachive_path, 'app.yaml')
    if (!exists(app_yaml)) {
      if (!silent) pimmy.prototype.logger.prototype.error("Not a compatible rew app, seed file app.yaml could not be found. A bare minimum of a manifest with a package name is required for a rew app to be cached and processed")
      if (!silent) pimmy.prototype.logger.prototype.closeTitle()
      return null
    }
    let config = pimmy.prototype.utils.prototype.readYaml(app_yaml)
    if (config.install?.build) await build_path(unarachive_path)
    if (config.install?.cleanup) {
      for (const item of config.install.cleanup) {
        let item_path = path.prototype.join(unarachive_path, item)
        if (exists(item_path)) rm(item_path, true)
      }
    }
    await write(built_path, '')
    if (!silent) pimmy.prototype.logger.prototype.closeTitle()
    return unarachive_path
  }
  else if (key.startsWith('github:')) {
    let uid = genUid(
      24,
      key
    )
    let cache_path = path.prototype.join(_cache_path, uid)
    let homeUrl, branch, commit;
    ({homeUrl, branch, commit} = pimmy.prototype.utils.prototype.resolveGithubURL(key))

    if (!silent) pimmy.prototype.logger.prototype.info("Found GIT entry")
    if (!silent) pimmy.prototype.logger.prototype.log(`Cloning repo ${homeUrl} as cache entry ${uid}`)
    
    await shell.prototype.exec('git clone ' + homeUrl + " " + cache_path, {stdout: "piped"})
    if (branch) await shell.prototype.exec(`git checkout ${branch}`, {cwd: cache_path, stdout: "piped"})
    if (commit) await shell.prototype.exec(`git reset --hard ${commit}`, {cwd: cache_path, stdout: "piped"})
    if (!silent) pimmy.prototype.logger.prototype.closeTitle()
    return cache_path
  }
  else {
    let isInRepo = pimmy.prototype.repo.prototype.lookup(key)
    if (isInRepo) {
      return await pimmy.prototype.cache.prototype.resolve(isInRepo.url, update, true, silent)
    }
    else {
      if (!silent) pimmy.prototype.logger.prototype.error(`Couldn't resolve to cache entry ${key}`)
      if (!silent) pimmy.prototype.logger.prototype.closeTitle()
      return null
    }
  }
}
  
    






}
return globalThis.module.exports;
}          
}, ["app://rew.pimmy/features/cache/main"]);rew.prototype.mod.prototype.defineNew("/home/makano/workspace/pimmy/features/repo/main.coffee", {
"/home/makano/workspace/pimmy/features/repo/main.coffee"(globalThis){
with (globalThis) {
  rew.prototype.mod.prototype.package("pimmy::repo");


rew.prototype.mod.prototype.find(module, "#std.net");

// c = rew::channel::new ->

async function _fetchFile(url) {
  return await rew.prototype.net.prototype.fetch(url)
        .then($ => $.text())
        .catch(function() { return null })
}

repo.prototype.lookup = function(pkgname) {
  var results, index, parts, repo_name, real_name, path, data;
  results = []
  index = 0 

  // Parse names like "@repo/package"
  if (pkgname.startsWith("@")) {
    parts = pkgname.slice(1).split('/')
    if (parts.length != 2) {
      pimmy.prototype.logger.prototype.error(`Invalid qualified package: ${pkgname}`)
      return null
    };

    [repo_name, real_name] = parts
  }
  else {
    repo_name = null
    real_name = pkgname
  }

  while (true) {
    path = `cache/repo-cache/db_${index}.bin`
    try {
      data = JSON.parse(rew.prototype.encoding.prototype.bytesToString(rew.prototype.conf.prototype.readAuto(path)))
    }
    catch {
      break
    }

    for (const pkg of data) {
      if (repo_name && pkg.repo == repo_name && pkg.name == real_name) {
        return pkg
      }
      if (!repo_name && pkg.name == real_name) {
        results.push(pkg)
      }
    }

    index += 1
  }

  if (results.length > 0) {
    return results[0]
  }  
  else {
    pimmy.prototype.logger.prototype.warn(`Package not found: ${pkgname}`)
    return null
  }
}



async function _resolveGithub(name, github_url) {
  var baseUrl, pkg, files, app_content, app, icon_path, readme;
  ({ baseUrl } = pimmy.prototype.utils.prototype.resolveGithubURL(github_url))

  pkg = {
    name: name,
    url: github_url, 
  }

  files = ['app.yaml']

  app_content = await _fetchFile(baseUrl + "app.yaml")
  
  app = rew.prototype.yaml.prototype.parse(app_content)
  if (app?.assets?.icon) {
    icon_path = app.assets.icon
    pkg.icon = baseUrl + icon_path
  }
  if (app?.manifest?.readme) {
    readme = await _fetchFile(baseUrl + app?.manifest?.readme)
    pkg.readme = readme
  }
  if (app?.manifest?.tags) {
    pkg.tags = app?.manifest?.tags ?? []
  }
  if (app?.manifest?.description) {
    pkg.description = app.manifest.description
  }

  return pkg
}

async function _parseRepo(name, repo_url, seen = {}, result = []) {
  var data, repo, pkg;
  if (seen[repo_url]) return
  seen[repo_url] = true

  data = await rew.prototype.net.prototype.fetch("https:" + repo_url)
           .then($1 => $1.text())
           .catch(function() { return null })

  if (!data) {
    pimmy.prototype.logger.prototype.error(`Failed to fetch repo: ${repo_url}`)
    return
  }

  repo = rew.prototype.yaml.prototype.parse(data)

  // Recursively import other YAMLs
  for (const imported of repo.imports ?? []) {
    await _parseRepo(name, imported, seen, result)
  }

  // Resolve packages
  let ref;for (const pkgname in ref = repo.packages) {const value = ref[pkgname];
    if (typeof value == 'string' && value.startsWith("github:")) {
      pkg = await _resolveGithub(pkgname, value)
      if (pkg) pkg.repo = name
      if (pkg) result.push(pkg)
    }
    else {
      if (value.readme) value.readme = await _fetchFile(value.readme)
      result.push({ name: pkgname, repo: name, ...value })
    }
  }

  return result
}

repo.prototype.sync_all = async function(repo_name) {
  var repos, index, data, path;
  repos = conf.prototype.readYAML("repo/main.yaml")

  index = 0
  
  pimmy.prototype.loader.prototype.start("Downloading")
  for (const name in repos) {const url = repos[name];
    if (typeof repo_name == "string" && name !== repo_name) continue; 
    data = await _parseRepo(name, url)
    if (data) {
      path = `cache/repo-cache/db_${index}.bin`
      rew.prototype.conf.prototype.writeAuto(path, data)
      index += 1
    }
  }
  return pimmy.prototype.loader.prototype.stop()
}

pub(repo.prototype._check_init = function() {
  var config;
  try {
    config = rew.prototype.conf.prototype.readAuto("init.yaml")
    return config
  }
  catch {
    return false
  }
})

repo.prototype.init = function() {
  var init_file, pimmy_data_path;
  init_file = repo.prototype._check_init()
  if (init_file?._repo) return
  pimmy_data_path = conf.prototype.path()
  mkdir(path.prototype.join(pimmy_data_path, 'cache'))
  mkdir(path.prototype.join(pimmy_data_path, 'cache/app-cache'))
  mkdir(path.prototype.join(pimmy_data_path, 'cache/repo-cache'))
  mkdir(path.prototype.join(pimmy_data_path, 'repo'))

  conf.prototype.writeYAML('repo/main.yaml', {
    rewpkgs: "//raw.githubusercontent.com/kevinJ045/rewpkgs/main/main.yaml"
  })

  return rew.prototype.conf.prototype.writeAuto('init.yaml', { _init: init_file._init ?? false, _repo: true })
}


}
return globalThis.module.exports;
}          
}, ["app://rew.pimmy/features/repo/main"]);(function(module){
"no-compile"
if(!rew.extensions.has('net')) rew.extensions.add('net', (Deno, module) => rew.extensions.createClass({
  _namespace() {
    return "net";
  },
  _connect: Deno.net.connect,
  _listen: Deno.net.listen,
  connectTls: Deno.connectTls,
  createUdpSocket: Deno.net.createUdpSocket,
  createUnixSocket: Deno.net.createUnixSocket,
  createTcpListener: Deno.net.createTcpListener,
  createUnixListener: Deno.net.createUnixListener,
  createWebSocketStream: Deno.net.createWebSocketStream,
  createHttpStream: Deno.net.createHttpStream,

  connect: (opts) => {
    let onConnect = () => {};
    let conn = Deno.net.connect(opts)
    .then((socket) => {
      onConnect(socket);
    }).catch((err) => {
      if (onConnect) {
        onConnect(null, err);
      } else {
        throw err;
      }
    });
    return (cb) => { onConnect = cb; return conn; };
  },

  listen: (opts) => {
    let onListen = () => {};
    let listener = Deno.net.listen(opts);
    (async function(){
      for await (conn of listener) {
        onListen(conn, listener);
      }
    })();
    return (cb) => { onListen = cb; return listener; };
  },

  fetch: Deno.fetch.fetch,
}));
})({filename: "#std.net"});rew.prototype.mod.prototype.defineNew("/home/makano/workspace/pimmy/features/git/main.coffee", {
"/home/makano/workspace/pimmy/features/git/main.coffee"(globalThis){
with (globalThis) {
  
}
return globalThis.module.exports;
}          
}, ["app://rew.pimmy/features/git/main"]);rew.prototype.mod.prototype.defineNew("/home/makano/workspace/pimmy/features/project/main.coffee", {
"/home/makano/workspace/pimmy/features/project/main.coffee"(globalThis){
with (globalThis) {
  rew.prototype.mod.prototype.package("pimmy::project");
const civet_options = rew.prototype.mod.prototype.find(module,  "./civet.txt");
const main_types = rew.prototype.mod.prototype.find(module,  "./types.txt");

function yesify(thing) {
  if (thing) return "@cyan(yes)";
  else return "@yellow(no)"
}

function isYes(input) {
  return input.toLowerCase().startsWith('y')
}

function optionify(
  logs,
  cli_options,
  key,
) {
  if (cli_options.ignore) {
    return pimmy.prototype.logger.prototype.log(...logs, yesify(cli_options[key]))
  }
  else {
    return cli_options[key] = isYes(pimmy.prototype.logger.prototype.input(...logs))
  }
}

pimmy.prototype.project.prototype.new = function(cli_options) {
  let new_path = path.prototype.normalize(path.prototype.join(rew.prototype.process.prototype.cwd, typeof cli_options.new == "string" ? cli_options.new : ""))
  if (exists(new_path) && readdir(new_path).length) {
    pimmy.prototype.logger.prototype.error("Cannot overwrite a populated directory")
    return
  }
  
  pimmy.prototype.logger.prototype.title(":icon package bold yellow", `Creating at ${cli_options.new === true ? "." : cli_options.new}`)
  let app_name = path.prototype.basename(new_path)
  pimmy.prototype.logger.prototype.log("@gray(package?)", `@bold,green(${app_name})`)

  optionify(
    [":icon git bold yellow", "@gray(git?)"],
    cli_options,
    "git"
  )
  
  optionify(
    [":icon types blue", "@gray(types?)"],
    cli_options,
    "types"
  )
  
  pimmy.prototype.logger.prototype.closeTitle("Options set")

  pimmy.prototype.logger.prototype.title("Creating files")

  mkdir(new_path, true)
  write(path.prototype.join(new_path, "app.yaml"), rew.prototype.yaml.prototype.string({manifest: {"package": app_name}, entries: {main: "main.coffee"}}))
  pimmy.prototype.logger.prototype.log(":icon file blue", "Created file", "@green(app.yaml)")
  
  write(path.prototype.join(new_path, (cli_options.types? ("main.civet") : ("main.coffee"))), 'print "hello"')
  pimmy.prototype.logger.prototype.log(":icon file blue", "Created file", "@green(main.coffee)")

  if (cli_options.types) {
    mkdir(path.prototype.join(new_path, "_types"), true)
    write(path.prototype.join(new_path, "index.d.ts"), main_types)
    write(path.prototype.join(new_path, "civet.config.json"), civet_options)
    pimmy.prototype.logger.prototype.log(":icon file blue", "Created file", "@green(index.d.ts)")
    pimmy.prototype.logger.prototype.log(":icon file blue", "Created file", "@green(civet.config.json)")
  }

  if (cli_options.git) {
    pimmy.prototype.logger.prototype.log(":icon git bold yellow", "git init")
    shell.prototype.exec("git init .", {cwd: new_path, stdout: "piped"})
  }

  return pimmy.prototype.logger.prototype.closeTitle("Files Created")
}
}
return globalThis.module.exports;
}          
}, ["app://rew.pimmy/features/project/main"]);rew.prototype.mod.prototype.defineNew("/home/makano/workspace/pimmy/features/project/civet.txt", function(globalThis){
  return rew.prototype.mod.prototype.preprocess("/home/makano/workspace/pimmy/features/project/civet.txt", `{
  "parseOptions": {
    "coffeePrototype": true,
    "autoLet": true,
    "coffeeInterpolation": true,
    "coffeeComment": true
  }
}`);
}, ["app://rew.pimmy/features/project/civet"]);rew.prototype.mod.prototype.defineNew("/home/makano/workspace/pimmy/features/project/types.txt", function(globalThis){
  return rew.prototype.mod.prototype.preprocess("/home/makano/workspace/pimmy/features/project/types.txt", `// rew-global.d.ts

declare namespace Rew {
  interface ChannelContext {
    stop(): ChannelContext;
    start(): ChannelContext;
    setpoll(cb: () => void): ChannelContext;
  }

  interface Usage {
    name: string;
    system: (ctx: any, ...args: any[]) => void;
    args?: any[];
  }

  interface SubPackage {
    define(name: string, value: any): void;
    prototype?: Record<string, any>;
    packageName?: string;
    name?: string;
  }

  interface Namespace {
    name: string;
    system: (ctx: any, ...args: any[]) => void;
    namespace: any;
  }

  interface Private {
    child: any;
    args: any[];
  }

  interface Public {
    child: any;
    args: any[];
  }

  interface Mod {
    name: string;
    id?: string;
  }

  interface Ptr<T = any> {
    id: string;
    type?: string;
    inner: T;
  }

  interface Ops {
    op_dyn_imp(caller: string, path: string): Promise<[string, string]>;
    op_gen_uid(length: number, seed?: string): string;
    op_rand_from(min: number, max: number, seed?: string): number;
  }

  interface RewGlobal {
    __rew_symbols(): string;
  }

  interface EnvSystem {
    env: Record<string, string>;
    get(key: string): string | undefined;
    set(key: string, value: string): this;
    delete(key: string): this;
    has(key: string): boolean;
    keys(): string[];
  }

  interface RewFS {

    open(path: string, options?: any): any;

    read(path: string, options?: { binary?: boolean }): Promise<string | Uint8Array>;
    write(
      path: string,
      content: string | number[] | Uint8Array,
      options?: { binary?: boolean; create_dirs?: boolean }
    ): Promise<void>;

    readBinary(path: string): Promise<Uint8Array>;
    writeBinary(path: string, data: Uint8Array): Promise<void>;

    stringToBytes(str: string): Uint8Array;
    bytesToString(bytes: Uint8Array): string;

    sha(path: string): string;

    exists(path: string): boolean;

    rm(path: string, recursive?: boolean): Promise<void>;
    rmrf(path: string): Promise<void>;

    mkdir(path: string, recursive?: boolean): Promise<void>;
    ensureDir(path: string): Promise<void>;

    stats(path: string): RewFSStats;

    readdir(
      path: string,
      options?: {
        include_hidden?: boolean;
        filter_type?: 'file' | 'dir' | null;
        sort_by?: 'name' | 'date' | null;
      }
    ): RewFSEntry[];

    copy(
      src: string,
      dest: string,
      options?: {
        recursive?: boolean;
        create_dirs?: boolean;
        overwrite?: boolean;
      }
    ): Promise<void>;

    rename(src: string, dest: string): Promise<void>;

    isDirectory(path: string): boolean;
    isFile(path: string): boolean;
  }

  interface RewFSStats {
    isFile: boolean;
    isDirectory: boolean;
    isSymlink: boolean;
    size: number;
    modified?: number;
    created?: number;
    accessed?: number;
    permissions: {
      readonly: boolean;
      mode?: number;
    };
  }

  interface RewFSEntry {
    name: string;
    path: string;
    isFile: boolean;
    isDirectory: boolean;
    isSymlink: boolean;
  }

  interface RewConf {
    read(key: string): string;
    write(key: string, content: string | object): Promise<void>;
    delete(key: string): Promise<void>;
    exists(key: string): boolean;

    path(): string;

    list(prefix?: string): string[];

    readJSON<T = any>(key: string): T;
    writeJSON(key: string, data: object): Promise<void>;

    readYAML<T = any>(key: string): T;
    writeYAML(key: string, data: object): Promise<void>;

    readBinary(key: string): Uint8Array;
    writeBinary(key: string, data: Uint8Array | number[]): Promise<void>;

    readAuto<T = any>(key: string): T | Uint8Array | string;
    writeAuto(key: string, data: any): Promise<void>;

    getInfo(key: string): {
      exists: boolean;
      format: "json" | "yaml" | "binary" | "text";
    };

    current_app: {
      config: {
        manifest?: {
          package?: string;
        };
      };
      path: string;
    };
  }

  type FFIPrimitiveType =
    | "void"
    | "pointer"
    | "buffer"
    | "u8"
    | "u16"
    | "u32"
    | "u64"
    | "i8"
    | "i16"
    | "i32"
    | "i64"
    | "f32"
    | "f64";

  interface FFIStruct {
    struct: Record<string, FFIPrimitiveType>;
  }

  type FFIType = FFIPrimitiveType | FFIStruct;

  interface FFITypeDef {
    pre?: (result: any) => any;
    parameters: FFIType[];
    result: FFIType;
  }

  interface RewFFI {
    _namespace(): string;

    cwd(): void;

    pre(...types: FFIType[]): () => FFIType[];

    typed(...typesAndFn: [...FFIType[], () => FFIType | [FFIType, (result: any) => any]]): FFITypeDef | undefined;

    void: "void";
    ptr: "pointer";
    buffer: "buffer";
    u8: "u8";
    u16: "u16";
    u32: "u32";
    u64: "u64";
    i8: "i8";
    i16: "i16";
    i32: "i32";
    i64: "i64";
    f32: "f32";
    f64: "f64";

    struct(def: Record<string, FFIPrimitiveType>): FFIStruct;

    open_raw<T = unknown>(libPath: string, symbols: Record<string, any>): T;

    open<T = Record<string, (...args: any[]) => any>>(libPath: string, instance: Record<string, FFITypeDef>): T;

    autoload<T = Record<string, any>>(libPath: string): T;
  }

  type ServeOptions = TcpOptions | UnixOptions;

  interface TcpOptions {
    port: number;
    hostname?: string;
    onListen?: (params: { port: number; hostname: string }) => void;
    signal?: AbortSignal;
    reusePort?: boolean;
    reuseAddr?: boolean;
    cert?: string;
    key?: string;
    alpnProtocols?: string[];
  }

  interface UnixOptions {
    path: string;
    onListen?: (params: { path: string }) => void;
    signal?: AbortSignal;
    reusePort?: boolean;
    reuseAddr?: boolean;
    cert?: string;
    key?: string;
    alpnProtocols?: string[];
  }

  interface Handler {
    (request: Request): Response | Promise<Response>;
  }

  interface HttpConnection {
    [key: string]: any
  }

  function serve(options: ServeOptions, handler: Handler): ServerInstance;
  function serveHttp(conn: ConnLike): HttpConnection;
  function upgradeWebSocket(request: Request): {
    response: Response;
    socket: WebSocket;
  };

  interface ConnLike {
    readonly rid: number;
    close(): void;
    readable: ReadableStream<Uint8Array>;
    writable: WritableStream<Uint8Array>;
  }

  interface ServerInstance {
    finished: Promise<void>;
    shutdown(): Promise<void>;
  }

  class Request {
    constructor(input: string | URL | Request, init?: RequestInit);
    readonly method: string;
    readonly url: string;
    readonly headers: Headers;
    readonly body: ReadableStream<Uint8Array> | null;
    clone(): Request;
  }

  // Base Response class
  class Response {
    constructor(body?: BodyInit | null, init?: ResponseInit);
    static json(data: unknown, init?: ResponseInit): Response;
  }

  // Headers polyfill
  class Headers {
    constructor(init?: HeadersInit);
    append(name: string, value: string): void;
    delete(name: string): void;
    get(name: string): string | null;
    has(name: string): boolean;
    set(name: string, value: string): void;
    forEach(callback: (value: string, name: string) => void): void;
  }

  // Type aliases
  type HeadersInit = Headers | Record<string, string> | [string, string][];
  type BodyInit =
    | ReadableStream<Uint8Array>
    | ArrayBuffer
    | Blob
    | string
    | FormData
    | URLSearchParams;

  interface RequestInit {
    method?: string;
    headers?: HeadersInit;
    body?: BodyInit | null;
    signal?: AbortSignal;
  }

  interface ResponseInit {
    status?: number;
    statusText?: string;
    headers?: HeadersInit;
  }


  interface RewHttp {
    serveSimple(
      options: ServeOptions,
      handler: Handler
    ): ServerInstance;

    withOptions(
      options: ServeOptions
    ): (handler: Handler) => ServerInstance;

    serveHttp(conn: ConnLike): HttpConnection;

    upgradeWebSocket(request: Request): {
      response: Response;
      socket: WebSocket;
    };

    Request: typeof Request;
    Response: typeof Response;
  }


  interface RewEncoding {

    toBase64(data: string | Uint8Array): string;
    fromBase64(encoded: string, options?: { asString?: false }): Uint8Array;
    fromBase64(encoded: string, options: { asString: true }): string;

    stringToBytes(str: string): Uint8Array;
    bytesToString(bytes: Uint8Array): string;

    encodeURIComponent(str: string): string;
    decodeURIComponent(str: string): string;

    bytesToHex(bytes: Uint8Array): string;
    hexToBytes(hex: string): Uint8Array;
  }

  interface ListenerLike extends AsyncIterable<ConnLike> {
    accept(): Promise<ConnLike>;
    close(): void;
    addr: Addr;
  }

  type Addr =
    | { transport: "tcp" | "udp"; hostname: string; port: number }
    | { transport: "unix"; path: string };

  interface NetConnectOptions {
    hostname: string;
    port: number;
    transport?: "tcp" | "udp";
  }

  interface NetListenOptions {
    hostname?: string;
    port: number;
    transport?: "tcp" | "udp";
  }

  interface TlsConnectOptions extends NetConnectOptions {
    certFile?: string;
    keyFile?: string;
    caCerts?: string[];
    alpnProtocols?: string[];
    servername?: string;
  }

  interface UdpOptions {
    port?: number;
    hostname?: string;
    broadcast?: boolean;
    multicast?: boolean;
  }

  interface WebSocketStreamOptions {
    protocols?: string[];
    signal?: AbortSignal;
  }

  interface WebSocketStream {
    socket: WebSocket;
    response: Response;
  }

  interface HttpStream {
    readable: ReadableStream<Uint8Array>;
    writable: WritableStream<Uint8Array>;
    response: Response;
  }


  interface RewNet {
    _connect(options: NetConnectOptions): Promise<ConnLike>;
    _listen(options: NetListenOptions): ListenerLike;

    connectTls(options: TlsConnectOptions): Promise<ConnLike>;
    createUdpSocket(options: UdpOptions): Promise<ConnLike>;
    createUnixSocket(path: string): Promise<ConnLike>;
    createTcpListener(options: NetListenOptions): ListenerLike;
    createUnixListener(path: string): ListenerLike;
    createWebSocketStream(
      request: Request,
      options?: WebSocketStreamOptions
    ): Promise<WebSocketStream>;

    createHttpStream(
      request: Request
    ): Promise<HttpStream>;

    connect(
      options: NetConnectOptions
    ): (
      cb: (socket: ConnLike | null, error?: Error) => void
    ) => Promise<void>;

    listen(
      options: NetListenOptions
    ): (
      cb: (conn: ConnLike, listener: ListenerLike) => void
    ) => ListenerLike;

    fetch(
      input: string | Request,
      init?: RequestInit
    ): Promise<Response>;
  }

  interface SystemMemoryInfo {
    total: number;
    free: number;
    available: number;
    buffers: number;
    cached: number;
    swapTotal: number;
    swapFree: number;
  }

  interface NetworkInterface {
    name: string;
    family: "IPv4" | "IPv6";
    address: string;
    netmask: string;
    scopeid?: number;
    cidr: string;
    mac: string;
  }

  interface UserInfo {
    username: string | undefined;
    uid: number;
    gid: number;
  }


  interface RewOs {
    slug: string;
    arch: string;
    family: string;
    release: string;

    readonly loadavg: [number, number, number];
    readonly uptime: number;
    readonly hostname: string;

    mem(): SystemMemoryInfo;
    networkInterfaces(): NetworkInterface[];

    readonly homeDir: string | undefined;
    readonly tempDir: string | undefined;

    userInfo(): UserInfo;
  }

  interface RewPath {
    _namespace(): 'path';

    resolveFrom(base: string, relative: string): string;
    resolve(...paths: string[]): string;

    choose(...paths: string[]): string | null;

    join(...segments: string[]): string;
    normalize(path: string): string;
    dirname(path: string): string;
    basename(path: string): string;
    extname(path: string): string;

    isAbsolute(path: string): boolean;
    relative(from: string, to: string): string;
  }


  interface RewProcess {
    status(): Promise<RewProcessStatus>;
    output(): Promise<Uint8Array>;
    stderrOutput(): Promise<Uint8Array>;
    close(): void;
  }

  interface RewProcessStatus {
    success: boolean;
    code: number;
    signal?: string;
  }

  interface RewCommand {
    outputSync(): {
      success: boolean;
      code: number;
      stdout: Uint8Array;
      stderr: Uint8Array;
    };
  }

  interface RewShell {

    ChildProcess: any; // runtime class, unknown shape

    kill(pid: number, signal?: string): void;

    spawn(
      command: string | string[],
      options?: {
        cwd?: string;
        env?: Record<string, string>;
        stdin?: "piped" | "inherit" | "null";
        stdout?: "piped" | "inherit" | "null";
        stderr?: "piped" | "inherit" | "null";
      }
    ): RewProcess;

    wait(process: RewProcess): Promise<RewProcessStatus>;

    fexec(
      command: string | string[],
      options?: {
        cwd?: string;
        env?: Record<string, string>;
        stdout?: "piped" | "inherit" | "null";
        stderr?: "piped" | "inherit" | "null";
      }
    ): Promise<{
      status: RewProcessStatus;
      output: Promise<Uint8Array>;
      error: Promise<Uint8Array>;
    }>;

    sync(
      command: string | string[],
      options?: {
        cwd?: string;
        env?: Record<string, string>;
        stdout?: "piped" | "inherit" | "null";
        stderr?: "piped" | "inherit" | "null";
      }
    ): Uint8Array;

    command(
      command: string | string[],
      options?: {
        args?: string[];
        cwd?: string;
        env?: Record<string, string>;
        stdin?: "inherit" | "piped" | "null";
        stdout?: "inherit" | "piped" | "null";
        stderr?: "inherit" | "piped" | "null";
      }
    ): RewCommand;

    exec(
      command: string | string[],
      options?: {
        args?: string[];
        cwd?: string;
        env?: Record<string, string>;
        stdin?: "inherit" | "piped" | "null";
        stdout?: "inherit" | "piped" | "null";
        stderr?: "inherit" | "piped" | "null";
        onlyString?: boolean;
      }
    ): Uint8Array | string;
  }

  interface RewThread {
    id: number;

    postMessage(message: any): void;

    terminate(): void;

    receiveMessage(timeout?: number): any;

    onmessage(fn: ((event: { data: any }) => void) | null): void;
  }

  interface RewThreads {
    /**
     * Spawn a new thread with provided code.
     * Accepts a string or a function (automatically stringified).
     */
    spawn(code: string | (() => void)): number;

    /**
     * List all live thread IDs.
     */
    list(): number[];

    /**
     * Terminate one or more threads by ID.
     */
    terminate(...ids: number[]): void[];

    /**
     * Create and manage a thread with message passing.
     */
    create(code: string | (() => void)): RewThread;
  }

  interface ProcessSystem {
    pid: number;
    ppid: number;
    cwd: string;
    execPath: string;
    args: string[];
    onExit(cb: () => void): void;
    exit(code?: number): never;
  }

  interface BootstrapSystem {
    compile(...args: any[]): any;
  }

  interface VFileSystem {
    find(path: string): any;
    add(path: string, content: any): void;
  }

  interface IOSubsystem {
    out: WritableStream & {
      print: (...args: any[]) => void;
      err: (...args: any[]) => void;
      printf: (format: string, ...args: any[]) => void;
    };
    in: WritableStream & {
      input: (...args: any[]) => string;
    };
    err: WritableStream;
    _namespace(): {
      print: (...args: any[]) => void;
      printerr: (...args: any[]) => void;
      printf: (format: string, ...args: any[]) => void;
      input: (...args: any[]) => string;
    };
  }

  interface RewObject<T> {
    prototype: T
  }
}

declare const module: {
  filename: string,
  exports: any,
  options: Record<string, any>,
  app: {
    path: string,
    config: {
      manifest: {
        package: string,
        [key: string]: any
      },
      [key: string]: any
    }
  }
};

declare const rew: Rew.RewObject<{
  ns: any,
  ptr: Rew.RewObject<{
    of<T>(val: T): any,
    fn(params: any[], result: any, callback: CallableFunction): any,
    view(ptr: any): any,
    read(ptr: any, type: string): any
    write(ptr: any, value: any, type: string): any,
    deref(ptr: any, length: number): any,
    toBytes(ptr: any, length: number): Uint8Array
    string(ptr: any, length: number): any
  }>;
  mod: Rew.RewObject<{
    define(id: string, mod: any): void;
    get(id: string): any;
  }>;
  channel: Rew.RewObject<{
    new(interval: number | (() => void), cb?: () => void): Rew.ChannelContext;
    interval(interval: number, cb: () => void): number;
    timeout(interval: number, cb: () => void): number;
    timeoutClear(handle: number): void;
    intervalClear(handle: number): void;
  }>;

  env: Rew.RewObject<Rew.EnvSystem>;

  process: Rew.RewObject<Rew.ProcessSystem>;

  bootstrap: Rew.RewObject<Rew.BootstrapSystem>;

  vfile: Rew.RewObject<Rew.VFileSystem>;

  io: Rew.RewObject<Rew.IOSubsystem>;

  conf: Rew.RewObject<Rew.RewConf>;
  encoding: Rew.RewObject<Rew.RewEncoding>;
  ffi: Rew.RewObject<Rew.RewFFI>;
  fs: Rew.RewObject<Rew.RewFS>;
  http: Rew.RewObject<Rew.RewHttp>;
  net: Rew.RewObject<Rew.RewNet>;
  os: Rew.RewObject<Rew.RewOs>;
  path: Rew.RewObject<Rew.RewPath>;
  shell: Rew.RewObject<Rew.RewShell>;
  threads: Rew.RewObject<Rew.RewThreads>;

  [key: string]: any
}>;

declare function imp(filename: string): Promise<any>;

declare function genUid(length?: number, seed?: string): string;

declare function randFrom(min: number, max: number, seed?: string): number;

declare function pickRandom<T>(...values: T[]): T;
declare function pickRandomWithSeed<T>(seed: string | undefined, ...values: T[]): T;

declare const pvt: {
  (child: any, ...args: any[]): Rew.Private;
  is(item: any): item is Rew.Private;
};

declare const pub: {
  (child: any, ...args: any[]): Rew.Public;
  is(item: any): item is Rew.Public;
};

declare function instantiate<T>(...args: any[]): T;

declare function namespace(ns: object, fn?: Function): Rew.Namespace;

declare const JSX: Rew.Usage;

declare function using(usage: Rew.Usage | Rew.Namespace | Rew.Private | Rew.Public | string, ...args: any[]): void;


declare function print(...args: any[]): void;
declare function printf(format: string, ...args: any[]): void;
declare function input(...args: any[]): string;

declare const Usage: {
  create(fn: Function): Rew.Usage;
};

declare function typedef(
  value: any,
  strict?: boolean
): {
  strict: boolean;
  defaultValue: any;
  class: Function;
  type: string;
  isConstucted: boolean;
  isEmpty: boolean;
};

declare function typeis(obj: any, typeDef: any): boolean;

declare function typex(child: any, parent: any): boolean;

declare function typei(child: any, parent: any): boolean;

declare function int(v: any): number;

declare namespace int {
  const type: {
    strict: boolean;
    defaultValue: number;
    class: Function;
    type: string;
    isConstucted: boolean;
    isEmpty: boolean;
  };
}
declare function float(v: any): number;
declare namespace float {
  const type: {
    strict: boolean;
    defaultValue: number;
    class: Function;
    type: string;
    isConstucted: boolean;
    isEmpty: boolean;
  };
}
declare function num(v: any): number;
declare namespace num {
  const type: {
    strict: boolean;
    defaultValue: number;
    class: Function;
    type: string;
    isConstucted: boolean;
    isEmpty: boolean;
  };
}
declare function str(str: any): string;
declare namespace str {
  const type: {
    strict: boolean;
    defaultValue: string;
    class: Function;
    type: string;
    isConstucted: boolean;
    isEmpty: boolean;
  };
}
declare function bool(value: any): boolean;
declare namespace bool {
  const type: {
    strict: boolean;
    defaultValue: boolean;
    class: Function;
    type: string;
    isConstucted: boolean;
    isEmpty: boolean;
  };
}

declare function struct(template: {
  [key: string]: any;
}): (...args: any[]) => any;

interface MatchContext<T, V>{
  on(type: V, cb: (val: V) => T): this
  default(cb: (val: V) => T): this
  end: T
}
declare function match<T = any, V = any>(val: any): MatchContext<T, V>;

declare const toBytes: (string: string) => Uint8Array;
declare const strBytes: (bytes: Uint8Array) => string;
`);
}, ["app://rew.pimmy/features/project/types"]);rew.prototype.mod.prototype.defineNew("/home/makano/workspace/pimmy/features/cli/main.coffee", {
"/home/makano/workspace/pimmy/features/cli/main.coffee"(globalThis){
with (globalThis) {
  rew.prototype.mod.prototype.package("pimmy::cli");

using(namespace(rew.prototype.ns))
let OPTIONS = []

pimmy.prototype.cli.prototype.option = function(...args) { return Usage.prototype.create(function() {
  return OPTIONS.push(args)
}) }

pimmy.prototype.cli.prototype.parse = function(args) { return Usage.prototype.create(function(ctx) {
  let parser = pimmy.prototype.cli.prototype.parser.prototype.new();
  for (const option of OPTIONS) {
    parser.option(...option)
  }
  return ctx.cli_options = parser.parse(args)
}) }

pimmy.prototype.cli.prototype.parser = class CliParser {
  options
  aliases
  parsed
  constructor() {
    this.options = {}
    this.aliases = {}
    this.parsed = {}
    this
  }

  new() {
    return new CliParser()
  }

  option(name, config = {}) {
    this.options[name] = config
    if (config.alias != null) {
      this.aliases[config.alias] = name
    }
    return this
  }

  parse(args) {
    let i = 0
    while (i < args.length) {
      let arg = args[i]

      if (arg.startsWith('--')) {
        let key = arg.slice(2)
        let name = this.aliases[key] || key
        let config = this.options[name] || {}
        if (config.type === 'boolean') {
          this.parsed[name] = true
        }
        else {
          let val = args[i+1]
          if ((val == null) || val.startsWith('-')) {
            this.parsed[name] = true
          }
          else {
            this.parsed[name] = val
            i += 1
          }
        }
      }
      else if (arg.startsWith('-')) {
        let shortFlags = arg.slice(1)
        for (const ch of shortFlags) {
          let name = this.aliases[ch] || ch
          let config = this.options[name] || {}
          if (config.type === 'boolean') {
            this.parsed[name] = true
          }
          else {
            let val = args[i+1]
            if ((val == null) || val.startsWith('-')) {
              this.parsed[name] = true
            }
            else {
              this.parsed[name] = val
              i += 1
            }
          }
        }
      }
      else {
        if (this.parsed._ == null) {
          this.parsed._ = []
        }
        this.parsed._.push(arg)
      }
      i += 1
    }

    return this.parsed
  }
}
}
return globalThis.module.exports;
}          
}, ["app://rew.pimmy/features/cli/main"]);
rew.prototype.mod.prototype.get('app://rew.pimmy/main');