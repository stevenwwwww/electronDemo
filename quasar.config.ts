// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-file

import { defineConfig } from '#q-app/wrappers';

export default defineConfig((/* ctx */) => {
  return {
    // https://v2.quasar.dev/quasar-cli-vite/prefetch-feature
    // preFetch: true,

    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://v2.quasar.dev/quasar-cli-vite/boot-files
    boot: [],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#css
    css: ['app.scss'],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      // 'ionicons-v4',
      // 'mdi-v7',
      // 'fontawesome-v6',
      // 'eva-icons',
      // 'themify',
      // 'line-awesome',
      // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

      'roboto-font', // optional, you are not bound to it
      'material-icons', // optional, you are not bound to it
    ],

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#build
    build: {
      target: {
        browser: ['es2022', 'firefox115', 'chrome115', 'safari14'],
        node: 'node20',
      },

      typescript: {
        strict: false,
        vueShim: true,
        // extendTsConfig (tsConfig) {}
      },

      vueRouterMode: 'hash', // available values: 'hash', 'history'
      // vueRouterBase,
      // vueDevtools,
      // vueOptionsAPI: false,

      // rebuildCache: true, // rebuilds Vite/linter/etc cache on startup

      // publicPath: '/',
      // analyze: true,
      // env: {},
      // rawDefine: {}
      // ignorePublicFolder: true,
      // minify: false,
      // polyfillModulePreload: true,
      // distDir

      // extendViteConf (viteConf) {},
      // viteVuePluginOptions: {},

      vitePlugins: [
        // Disabled for build
        // [
        //   'vite-plugin-checker',
        //   {
        //     vueTsc: true,
        //     eslint: {
        //       lintCommand: 'eslint -c ./eslint.config.js "./src*/**/*.{ts,js,mjs,cjs,vue}"',
        //       useFlatConfig: true,
        //     },
        //   },
        //   { server: false },
        // ],
      ],
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#devserver
    devServer: {
      // https: true,
      open: true, // opens browser window automatically
    },

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#framework
    framework: {
      config: {},

      // iconSet: 'material-icons', // Quasar icon set
      // lang: 'en-US', // Quasar language pack

      // For special cases outside of where the auto-import strategy can have an impact
      // (like functional components as one of the examples),
      // you can manually specify Quasar components/directives to be available everywhere:
      //
      // components: [],
      // directives: [],

      // Quasar plugins
      plugins: [],
    },

    // animations: 'all', // --- includes all animations
    // https://v2.quasar.dev/options/animations
    animations: [],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#sourcefiles
    // sourceFiles: {
    //   rootComponent: 'src/App.vue',
    //   router: 'src/router/index',
    //   store: 'src/store/index',
    //   pwaRegisterServiceWorker: 'src-pwa/register-service-worker',
    //   pwaServiceWorker: 'src-pwa/custom-service-worker',
    //   pwaManifestFile: 'src-pwa/manifest.json',
    //   electronMain: 'src-electron/electron-main',
    //   electronPreload: 'src-electron/electron-preload'
    //   bexManifestFile: 'src-bex/manifest.json
    // },

    // https://v2.quasar.dev/quasar-cli-vite/developing-ssr/configuring-ssr
    ssr: {
      prodPort: 3000, // The default port that the production server should use
      // (gets superseded if process.env.PORT is specified at runtime)

      middlewares: [
        'render', // keep this as last one
      ],

      // extendPackageJson (json) {},
      // extendSSRWebserverConf (esbuildConf) {},

      // manualStoreSerialization: true,
      // manualStoreSsrContextInjection: true,
      // manualStoreHydration: true,
      // manualPostHydrationTrigger: true,

      pwa: false,
      // pwaOfflineHtmlFilename: 'offline.html', // do NOT use index.html as name!

      // pwaExtendGenerateSWOptions (cfg) {},
      // pwaExtendInjectManifestOptions (cfg) {}
    },

    // https://v2.quasar.dev/quasar-cli-vite/developing-pwa/configuring-pwa
    pwa: {
      workboxMode: 'GenerateSW', // 'GenerateSW' or 'InjectManifest'
      // swFilename: 'sw.js',
      // manifestFilename: 'manifest.json',
      // extendManifestJson (json) {},
      // useCredentialsForManifestTag: true,
      // injectPwaMetaTags: false,
      // extendPWACustomSWConf (esbuildConf) {},
      // extendGenerateSWOptions (cfg) {},
      // extendInjectManifestOptions (cfg) {}
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-cordova-apps/configuring-cordova
    cordova: {
      // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true,
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/configuring-electron
    electron: {
      extendElectronMainConf (esbuildConf) {
        // Force CommonJS output for Electron main process
        esbuildConf.format = 'cjs';
        esbuildConf.target = 'node18';
        esbuildConf.platform = 'node';
        
        // Ensure axios and other Node.js modules are external
        esbuildConf.external = esbuildConf.external || [];
        esbuildConf.external.push('axios');
      },
      extendElectronPreloadConf (esbuildConf) {
        // Force CommonJS output for Electron preload
        esbuildConf.format = 'cjs';
        esbuildConf.target = 'node18';
        esbuildConf.platform = 'node';
      },

      extendPackageJson (json) {
        // Ensure package.json doesn't have "type": "module"
        delete json.type;
      },

      // Electron preload scripts (if any) from /src-electron, WITHOUT file extension
      preloadScripts: ['electron-preload'],

      // specify the debugging port to use for the Electron app when running in development mode
      inspectPort: 5858,

      bundler: 'builder', // 使用builder而不是packager以获得更好的控制

      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options
        // Support multiple platforms
        platform: 'all', // Build for all platforms (darwin, win32, linux)
        arch: 'x64', // Target x64 architecture
        out: 'dist/electron/Packaged',
        
        // macOS specific
        appBundleId: 'com.electron.quasar.demo',
        appCategoryType: 'public.app-category.productivity',
        
        // Windows specific
        win32metadata: {
          CompanyName: 'Electron Quasar Demo',
          FileDescription: 'Electron Quasar Demo Application',
          ProductName: 'Electron Quasar Demo',
          InternalName: 'electron-quasar-demo'
        },
        
        // Icon settings (will look for icon files in build/ directory)
        icon: undefined, // Let packager auto-detect icons
        
        // More specific ignore patterns to ensure axios files are included
        ignore: [
          /\.git/,
          /\.vscode/,
          /build-scripts/,
          /src-cordova/,
          /dist\/(?!electron)/,
          /node_modules\/.*\/test/,
          /node_modules\/.*\/tests/,
          /node_modules\/.*\/\.nyc_output/,
          /node_modules\/.*\/coverage/,
          /node_modules\/.*\/docs/,
          /node_modules\/.*\/examples/,
          /node_modules\/.*\/\.git/
        ]
      },

      builder: {
        // https://www.electron.build/configuration/configuration
        appId: 'com.electron.quasar.demo',
        productName: 'Electron Quasar Demo',
        
        // 确保包含所有必要的文件
        files: [
          '**/*',
          '!node_modules/*/{test,tests,testing}/**/*',
          '!node_modules/*/{example,examples}/**/*',
          '!node_modules/*/{doc,docs}/**/*',
          '!node_modules/*/{coverage,nyc_output}/**/*',
          '!node_modules/*/*.{md,markdown,txt}',
          'node_modules/axios/dist/**/*',
          'node_modules/axios/index.js',
          'node_modules/axios/lib/**/*'
        ],
        
        // Multi-platform build targets
        mac: {
          category: 'public.app-category.productivity',
          target: [
            {
              target: 'dmg',
              arch: ['x64', 'arm64']
            },
            {
              target: 'zip',
              arch: ['x64', 'arm64']
            }
          ]
        },
        
        win: {
          target: [
            {
              target: 'nsis',
              arch: ['x64', 'ia32']
            },
            {
              target: 'portable',
              arch: ['x64', 'ia32']
            }
          ]
        },
        
        linux: {
          target: [
            {
              target: 'AppImage',
              arch: ['x64']
            },
            {
              target: 'deb',
              arch: ['x64']
            }
          ]
        },
        
        directories: {
          buildResources: 'build',
          output: 'dist/electron/Packaged'
        }
      },
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-browser-extensions/configuring-bex
    bex: {
      // extendBexScriptsConf (esbuildConf) {},
      // extendBexManifestJson (json) {},

      /**
       * The list of extra scripts (js/ts) not in your bex manifest that you want to
       * compile and use in your browser extension. Maybe dynamic use them?
       *
       * Each entry in the list should be a relative filename to /src-bex/
       *
       * @example [ 'my-script.ts', 'sub-folder/my-other-script.js' ]
       */
      extraScripts: [],
    },
  };
});
