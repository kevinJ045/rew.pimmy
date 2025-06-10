JSON.parse(`{
  "name": "Rew Rust",
  "description": "Rewritting rew with rust",
  "stack": ["Rust"],
  "tags": ["Coffeescript", "Rust", "Runtime"],
  "github": "https://github.com/kevinj045/rew",
  "icon": "https://raw.githubusercontent.com/kevinJ045/rew-docs/main/assets/logo.png",
  "collaborators": [],


  "categories": [
  {
    "title": "Core Runtime",
    "tasks": [
      {
        "title": "Custom JS Runtime",
        "subtitle": "Built using Deno's \`JsRuntime\`",
        "color": "Red",
        "type": "Feature",
        "status": "Done",
        "difficulty": "Easy"
      },
      {
        "title": "Persistent Runtime State",
        "subtitle": "Maintains global runtime context across calls",
        "color": "Red",
        "type": "Feature",
        "status": "Done",
        "difficulty": "Easy"
      },
      {
        "title": "Module Execution",
        "subtitle": "Executes \`.rew\` (JavaScript/DSL) files",
        "color": "Red",
        "type": "Feature",
        "status": "Done",
        "difficulty": "Easy"
      },
      {
        "title": "Global Scope Injection",
        "subtitle": "Injects custom globals into JS context",
        "color": "Red",
        "type": "Feature",
        "status": "Done",
        "difficulty": "Easy"
      },
      {
        "title": "__rew_symbols Support",
        "subtitle": "Exposes available FFI functions/types via JSON",
        "color": "Yellow",
        "type": "Feature",
        "status": "Done",
        "difficulty": "Hard"
      },
      {
        "title": "Multi-threaded Runtime",
        "subtitle": "Support for running multiple runtimes in parallel",
        "color": "Green",
        "type": "Feature",
        "status": "Nope",
        "difficulty": "Hard"
      },
      {
        "title": "Runtime Metrics",
        "subtitle": "Collect and expose runtime performance metrics",
        "color": "Green",
        "type": "Feature",
        "status": "Nope",
        "difficulty": "Easy"
      },
      {
        "title": "Threads Feature",
        "subtitle": "Enables running tasks in other threads",
        "color": "Green",
        "type": "Feature",
        "status": "Done",
        "difficulty": "Easy"
      }
    ]
  },
  {
    "title": "FFI System",
    "tasks": [
      {
        "title": "rew_bindgen Proc Macro",
        "subtitle": "Macro to register Rust functions/types",
        "color": "Blue",
        "type": "Feature",
        "status": "Done",
        "difficulty": "Easy"
      },
      {
        "title": "Type/Struct Support",
        "subtitle": "Register Rust structs in FFI layer",
        "color": "Yellow",
        "type": "Feature",
        "status": "Doing",
        "difficulty": "Easy"
      },
      {
        "title": "Pointer/Buffer Handling",
        "subtitle": "Allow passing pointers and slices to/from JS",
        "color": "Yellow",
        "type": "Feature",
        "status": "Doing",
        "difficulty": "Easy"
      },
      {
        "title": "Error Handling",
        "subtitle": "Native Rust → JS error translation",
        "color": "Yellow",
        "type": "Feature",
        "status": "Done",
        "difficulty": "Easy"
      },
      {
        "title": "JSON Return Marshalling",
        "subtitle": "Return complex Rust data as JSON to JS",
        "color": "Yellow",
        "type": "Feature",
        "status": "Done",
        "difficulty": "Easy"
      },
      {
        "title": "Custom FFI Signature DSL",
        "subtitle": "Support simplified syntax for defining signatures",
        "color": "Green",
        "type": "Feature",
        "status": "Nope",
        "difficulty": "Easy"
      },
      {
        "title": "Async FFI Support",
        "subtitle": "Enable async Rust functions to be called from JS",
        "color": "Green",
        "type": "Feature",
        "status": "Nope",
        "difficulty": "Easy"
      }
    ]
  },
  {
    "title": "Directives System",
    "tasks": [
      {
        "title": "#declare Directive",
        "subtitle": "Local code transformation declarations",
        "color": "Red",
        "type": "Feature",
        "status": "Done",
        "difficulty": "Easy"
      },
      {
        "title": "#declare* Directive",
        "subtitle": "Global code transformation declarations",
        "color": "Red",
        "type": "Feature",
        "status": "Done",
        "difficulty": "Easy"
      },
      {
        "title": "AST Transform Engine",
        "subtitle": "Custom transformation engine for directives",
        "color": "Yellow",
        "type": "Feature",
        "status": "Nope",
        "difficulty": "Hard"
      },
      {
        "title": "Type Inference System",
        "subtitle": "Basic type tracking/inference for variables and expressions",
        "color": "Yellow",
        "type": "Feature",
        "status": "Nope",
        "difficulty": "Easy"
      },
      {
        "title": "Directive Validation",
        "subtitle": "Ensure directives are syntactically and semantically valid",
        "color": "Yellow",
        "type": "Feature",
        "status": "Nope",
        "difficulty": "Easy"
      }
    ]
  },
  {
    "title": "Standard Libraries",
    "tasks": [
      {
        "title": "Core FFI APIs",
        "subtitle": "Low-level interface for \`rew.bind(...)\`, etc.",
        "color": "Red",
        "type": "Feature",
        "status": "Done",
        "difficulty": "Easy"
      },
      {
        "title": "File System API",
        "subtitle": "\`fs.readFile\`, \`fs.writeFile\`, etc.",
        "color": "Red",
        "type": "Feature",
        "status": "Done",
        "difficulty": "Easy"
      },
      {
        "title": "Networking API",
        "subtitle": "TCP/UDP sockets, basic \`net.connect()\`",
        "color": "Red",
        "type": "Feature",
        "status": "Done",
        "difficulty": "Easy"
      },
      {
        "title": "HTTP/HTTPS Server",
        "subtitle": "\`http.createServer\`, serve requests/responses",
        "color": "Red",
        "type": "Feature",
        "status": "Done",
        "difficulty": "Easy"
      },
      {
        "title": "Fetch API",
        "subtitle": "\`fetch()\` or similar high-level HTTP client",
        "color": "Red",
        "type": "Feature",
        "status": "Done",
        "difficulty": "Easy"
      },icon
      {
        "title": "Timer API",
        "subtitle": "\`setTimeout\`, \`setInterval\`",
        "color": "Yellow",
        "type": "Feature",
        "status": "Done",
        "difficulty": "Easy"
      },
      {
        "title": "Database API",
        "subtitle": "Support for SQLite, Postgres, or other databases",
        "color": "Blue",
        "type": "Feature",
        "status": "Nope",
        "difficulty": "Easy"
      },
      {
        "title": "Stream API",
        "subtitle": "Support for readable/writable streams",
        "color": "Red",
        "type": "Feature",
        "status": "Done",
        "difficulty": "Easy"
      }
    ]
  }
  ]

  
}
`)
