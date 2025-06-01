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
rew.prototype.mod.prototype.find(module, "./features/cli/main.coffee");

// type
using(pimmy.prototype.cli.prototype.option('app', {type: 'string', alias: 'A'}))
using(pimmy.prototype.cli.prototype.option('repo', {type: 'string', alias: 'R'}))
// action
using(pimmy.prototype.cli.prototype.option('sync', {type: 'boolean', alias: 'S'}))
using(pimmy.prototype.cli.prototype.option('cache', {type: 'boolean', alias: 'c'}))
using(pimmy.prototype.cli.prototype.option('remove', {type: 'boolean', alias: 'r'}))
using(pimmy.prototype.cli.prototype.option('add', {type: 'boolean', alias: 'a'}))
using(pimmy.prototype.cli.prototype.option('build', {type: 'boolean', alias: 'b'}))
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
  if (cli_options.build && typeof cli_options.app == 'string') {
    return pimmy.prototype.builder.prototype.build(await pimmy.prototype.cache.prototype.resolve(cli_options.app), cli_options.safe)
  }
  else if (cli_options.cache) {
    if (typeof cli_options.app == 'string') {
      return pimmy.prototype.cache.prototype.resolve(cli_options.app)
    }
    else if (cli_options.repo) { 
      return pimmy.prototype.repo.prototype.sync_all(cli_options.repo)
    };return
  }
  else if (cli_options.sync) {
    if (cli_options.repo) {
      return pimmy.prototype.repo.prototype.sync_all(cli_options.repo)
    }
    else if (cli_options.app) {
      return pimmy.prototype.repo.prototype.lookup(cli_options.app)
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

function int(str) {
	return parseInt(str);
}
int.type = typedef(1);

function float(str) {
	return parseFloat(str);
}
float.type = typedef(1.0);

function num(str) {
	return Number(str);
}
num.type = typedef(1);

function str(str) {
	return str ? str.toString() : '';
}
str.type = typedef('');

function bool(value) {
	return typeof value == 'string' ? (value == 'true' ? true : false) : value !== null && value !== undefined;
}
bool.type = typedef(true);

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
	struct
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

pimmy.prototype.logger.prototype.LOG = false;

pimmy.prototype.logger.prototype.log = (color, prefix, icon, ...logs) => {
  if (pimmy.prototype.logger.prototype.LOG) {
    let text = '%c' + prefix + ((icon? ('[' + icon + '] ') : '')) + logs.join(' ')
    return rew.prototype.io.prototype.out.print(text, `color: ${color};font-weight:bold`)
  };return
}

pimmy.prototype.logger.prototype.title = (color, icon, ...logs) => {
  return pimmy.prototype.logger.prototype.log(color || 'white', '', icon, ...logs)
}

pimmy.prototype.logger.prototype.subtitle = (color, icon, ...logs) => {
  return pimmy.prototype.logger.prototype.log(color || 'white', '=> ', icon, ...logs)
}

pimmy.prototype.logger.prototype.action = (color, icon, ...logs) => {
  return pimmy.prototype.logger.prototype.log(color || 'white', '===> ', icon, ...logs)
}

pimmy.prototype.logger.prototype.error = (...logs) => {
  return rew.prototype.io.prototype.out.print('%c[ERROR] ' + logs.join(' '), 'color: red;font-weight:bold')
} 

pimmy.prototype.logger.prototype.info = (...logs) => {
  return rew.prototype.io.prototype.out.print('[LOG] ' + logs.join(' '))
}

pimmy.prototype.logger.prototype.warn = (...logs) => {
  return rew.prototype.io.prototype.out.print('%c[WARN] ' + logs.join(' '), 'color: yellow;font-weight:bold')
} 

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
  pimmy.prototype.logger.prototype.subtitle('blue', '', 'Copy Apps')
  let apps = rew.prototype.fs.prototype.readdir('./apps')
  for (const app of apps) {
    let app_path = rew.prototype.path.prototype.normalize(app.path)
    let dest = rew.prototype.path.prototype.join(pimmy.prototype.init.prototype.ROOT, 'apps', app.name)
    await rew.prototype.fs.prototype.copy(app.path, dest)
    pimmy.prototype.logger.prototype.action('green', 'X', "Copied", app.name, "to", dest)
  }
  return pimmy.prototype.logger.prototype.subtitle('blue', '', "Apps Copied")
}

pimmy.prototype.init.prototype.start = function() {
  if (pimmy.prototype.init.prototype._check_init()) return
  pimmy.prototype.logger.prototype.title('', '', 'Init Start')
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
  let app_path = rew.prototype.path.prototype.normalize(rew.prototype.path.prototype.join(rew.prototype.process.prototype.cwd, app_path_relative))
  let app_conf_path = rew.prototype.path.prototype.join(app_path, 'app.yaml')

  if (!rew.prototype.fs.prototype.exists(app_conf_path)) throw new Error('App not found');
  
  let config = pimmy.prototype.utils.prototype.readYaml(app_conf_path)
  pimmy.prototype.logger.prototype.title('', '*', 'Building App', config.manifest.package)
  
  if (!(config.crates || config.build)) throw new Error('no build candidates found');
  
  if (config.cakes) {
    for (const cakefile of config.cakes) {
      let cake = await imp(rew.prototype.path.prototype.join(app_path, cakefile))
      if (cake?.builders) {
        for (const key in cake.builders) {
          pimmy.prototype.builder.prototype[key] = cake.builders[key]
        }
      }
    }
  }

  if (config.crates) {
    cargo.prototype.build_crates_for(app_path, config, safe_mode)
  } 
  
  if (config.build) {
    const results=[];for (const file of config.build) {
      if (file.using) { 
        let build_fn = pimmy.prototype.builder.prototype[file.using]
        if (!build_fn) throw new ReferenceError(`Builder ${file.using} does not exist`)
        let input_path = rew.prototype.path.prototype.normalize(rew.prototype.path.prototype.join(app_path, file.input))
        let output_path = rew.prototype.path.prototype.normalize(rew.prototype.path.prototype.join(app_path, file.output))
        if (!exists(input_path)) throw new Error(`Input file ${input_path} not found`)
        await build_fn(app_path, config, file, input_path, output_path)
      }
      if (file.cleanup && !safe_mode) {
        rm(path.prototype.join(app_path, file.cleanup), true)
        results.push(pimmy.prototype.logger.prototype.action('green', '-', 'File Cleanup'))
      } else {results.push(void 0)}
    };return results;
  };return
}














}
return globalThis.module.exports;
}          
}, ["app://rew.pimmy/features/builder/main"]);rew.prototype.mod.prototype.defineNew("/home/makano/workspace/pimmy/features/builder/cargo.coffee", {
"/home/makano/workspace/pimmy/features/builder/cargo.coffee"(globalThis){
with (globalThis) {
  rew.prototype.mod.prototype.package("pimmy::builder::cargo");


cargo.prototype.build_crates_for = function(app_path, app_config, safe_mode) {
  pimmy.prototype.logger.prototype.subtitle('', '', "Building app crates for", app_config.manifest.package);
  
  const results=[];for (const crate of app_config.crates) {
    let crate_path = path.prototype.normalize(path.prototype.join(app_path, crate.path))
    pimmy.prototype.logger.prototype.action('green', '-', 'Building crate', crate.name)
    let result = shell.prototype.exec("cargo build --release", {cwd: crate_path, stdout: 'piped'})
    if (!crate.build) continue;
    if (!result.success) {
      pimmy.prototype.loader.prototype.stop()
      pimmy.prototype.logger.prototype.error('Failed to build cargo')
      print(rew.prototype.encoding.prototype.bytesToString(result.stderr))
      pimmy.prototype.logger.prototype.error('Cargo build failed')
      return 0
    }
    printf('\x1b[1A\\r')
    pimmy.prototype.logger.prototype.action('green', 'X', 'Built Crate', crate.name)
    if (crate.files) {
      for (const file of crate.files) {
        copy(path.prototype.join(app_path, file.input), path.prototype.join(app_path, file.output))
        if (file.cleanup) rm(path.prototype.join(app_path, file.cleanup), true)
      }
    }
  
    if (crate.cleanup && !safe_mode) {
      pimmy.prototype.logger.prototype.action('green', '-', 'Clean Up', crate.name)
      rm(path.prototype.join(app_path, crate.cleanup), true)
    }
    return 1
  };return results;
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

pimmy.prototype.cache.prototype.parse_name = function(key) {
  return key
}

pimmy.prototype.cache.prototype.resolve = function(key) {
  let app_path = path.prototype.resolveFrom(rew.prototype.process.prototype.cwd, key)
  if (exists(app_path)) {
    key
  }
  return pimmy.prototype.cache.prototype.parse_name(key)
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


function _resolveGithubURL(github_url) {
  var match, owner, repoName, branch, commit, baseUrl;
  match = github_url.match(/^github:([^\/]+)\/([^@#]+)(?:@([^#]+))?(?:#(.+))?$/)
  if (!match) {
    pimmy.prototype.logger.prototype.error(`Invalid GitHub URL: ${github_url}`)
    return null
  };

  [, owner, repoName, branch, commit] = match
  branch = branch ?? "main"

  baseUrl = `https://raw.githubusercontent.com/${owner}/${repoName}/${branch}/`
  return ({baseUrl, owner, repoName, branch, commit})
}


async function _resolveGithub(name, github_url) {
  var baseUrl, pkg, files, app_content, app, icon_path, readme;
  ({ baseUrl } = _resolveGithubURL(github_url))

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
      if (pkg) result.push(pkg)
    }
    else {
      if (value.readme) value.readme = await _fetchFile(value.readme)
      result.push({ name: pkgname, ...value })
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
  mkdir(path.prototype.join(pimmy_data_path, 'cache/repo-cache'))
  mkdir(path.prototype.join(pimmy_data_path, 'cache/repo-cache'))
  mkdir(path.prototype.join(pimmy_data_path, 'repo'))

  conf.prototype.writeYAML('repo/main.yaml', {
    rewpkgs: "//raw.githubusercontent.com/kevinJ045/rewpkgs/main/main.yaml"
  })

  rew.prototype.conf.prototype.writeAuto('init.yaml', { _init: init_file._init ?? false, _repo: true })
  return pimmy.prototype.logger.prototype.action('green', 'X', "Created rewpkgs repo")
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
}, ["app://rew.pimmy/features/git/main"]);rew.prototype.mod.prototype.defineNew("/home/makano/workspace/pimmy/features/cli/main.coffee", {
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