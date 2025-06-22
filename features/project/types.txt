// rew-global.d.ts

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

    read(path: string, options?: { binary?: boolean }): string | Uint8Array;
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
