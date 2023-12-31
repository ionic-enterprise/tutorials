// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

const { remarkCodeHike } = require("@code-hike/mdx");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Ionic Enterprise Tutorials',
  favicon: 'img/favicon-96x96.png',

  url: 'https://ionic-enterprise.github.io',
  baseUrl: '/docs/tutorials',
  organizationName: 'ionic-enterprise',
  projectName: 'tutorials',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          beforeDefaultRemarkPlugins: [[remarkCodeHike, { lineNumbers: true }]],
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
        },
        theme: {
          customCss: [
            require.resolve("@code-hike/mdx/styles.css"),
            require.resolve('./src/css/custom.css')
          ]
        },
      }),
    ],
  ],
  themes: ['mdx-v2'],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Enterprise Tutorials',
        logo: {
          alt: 'Ionic Enterprise Tutorials',
          src: 'img/logo.svg',
        }
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
