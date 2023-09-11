# Website

This website is built using [Docusaurus 2](https://docusaurus.io/), a modern static website generator.

### Installation

```
$ npm install
```

### Local Development

```
$ npm start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```
$ npm run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

```
$ USE_SSH=true npm run deploy
```

This command will deploy the latest version of the `main` branch to <a href="https://ionic-enterprise.github.io/tutorials/" target="_blank">https://ionic-enterprise.github.io/tutorials/</a>.
