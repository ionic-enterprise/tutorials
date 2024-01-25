/** @type {import('@docusaurus/types').DocusaurusConfig} */

const { themes } = require('prism-react-renderer');
const { remarkCodeHike } = require('@code-hike/mdx');

module.exports = {
  title: 'Ionic Enterprise Tutorials',
  url: 'https://ionic.io',
  trailingSlash: false,
  baseUrl: '/docs/tutorials/',
  baseUrlIssueBanner: false,
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon-96x96.png',
  organizationName: 'ionic-enterprise',
  projectName: 'tutorials',
  titleDelimiter: '-',
  themeConfig: {
    logo: {
      alt: 'Ionic Enterprise Tutorials',
      src: 'img/logo.svg',
      srcDark: 'img/favicon-96x96.png',
      href: '/docs/tutorials',
      height: 24,
      width: 80,
    },
    sidebar: {
      productDropdown: {
        title: 'Enterprise Tutorials',
        logo: {
          width: 20,
          height: 20,
          alt: 'Enterprise Tutorials',
          src: 'img/favicon-96x96.png',
        },
      },
      backButton: {
        url: {
          href: '/docs',
        },
      },
    },
    colorMode: {
      respectPrefersColorScheme: true,
    },
    prism: {
      theme: themes.github,
      darkTheme: themes.dracula,
      additionalLanguages: ['shell-session', 'kotlin', 'groovy', 'java', 'swift', 'ruby', 'json', 'bash'],
    },
    zoom: {
      selector: '.markdown em > img',
      background: {
        light: 'var(--token-background-color)',
        dark: 'var(--token-background-color)',
      },
      config: {
        margin: 75,
        scrollOffset: 20,
      },
    },
  },
  plugins: ['docusaurus-plugin-image-zoom'],
  presets: [
    [
      '@ionic-docs/preset-classic',
      {
        docs: {
          beforeDefaultRemarkPlugins: [[remarkCodeHike, { lineNumbers: true }]],
          routeBasePath: '/docs/tutorials',
          sidebarPath: require.resolve('./sidebars.js'),
          breadcrumbs: false,
        },
        pages: false,
        theme: {
          customCss: [
            require.resolve("@code-hike/mdx/styles.css"),
            require.resolve('./src/styles/custom.css')
          ],
        },
      },
    ],
  ],
};
