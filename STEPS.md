- ~~Make framework an independent module~~
- ~~Make it configurable via config file or object~~
- ~~Autodiscover app loops~~
    - They configure themselves
- ~~Create plugin system~~
    - with all important framework parts as default plugins
    - implement hooks for plugins
        - onBeforeInitialize
        - onInitialized
    - provide all constants in a single object (remember to insert ALL error constants)


- ~~All plugins should be a "YanfModel"~~
- ~~Create central ModelRegistry~~
- ~~Routes should use the ModelRegistry~~
- ~~Make user model extendable~~
- ~~Authentication plugin: Fields which are included/excluded depend on user type~~
- ~~Static lang files should be provided dynamically~~
- ~~Create working test~~
- ~~Make it a monorepo~~
- Start documentation
- Refactor notification system
- Provide simple e-mail template fillable with content
- Frontend bindings