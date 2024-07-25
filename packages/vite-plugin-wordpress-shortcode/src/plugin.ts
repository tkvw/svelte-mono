import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PluginOption, ResolvedConfig } from 'vite';
export interface WordpressPluginOptions {
  devUrl?: string;
  entry?: string;
  main?: string;
  shortcode: string;
  shadowDom?: boolean;
  prefix?: string;
  templates?: {
    development?: string;
    production?: string;
  };
}

const name = 'wordpress-shortcode';
export default function wordpressShortcodePlugin(
  options: WordpressPluginOptions
): false | PluginOption {
  const {
    devUrl = 'http://localhost:5173',
    main = 'src/main.ts',
    templates = {},
    entry = 'src/wordpress.ts',
    shortcode,
    prefix = 'vpws_' + shortcode.replace(/[^\w]/g, '_'),
    shadowDom = false
  } = options;

  const currentDirUrl = new URL('..', import.meta.url);
  const defaultDevelopmentTemplateUrl = new URL('./templates/development.php', currentDirUrl);
  const defaultProductionTemplateUrl = new URL('./templates/production.php', currentDirUrl);

  const {
    development = defaultDevelopmentTemplateUrl.href,
    production = defaultProductionTemplateUrl.href
  } = templates;

  let _config: undefined | ResolvedConfig = undefined;

  function writeTemplate(url: string, substitutions: Record<string, string> = {}) {
    const outdir = _config?.build?.outDir!;
    const templatePath = fileURLToPath(url);

    substitutions = {
      ...substitutions,
      SHORTCODE_CODE: shortcode,
      SHORTCODE_SHADOW: String(shadowDom),
      ...Object.fromEntries(
        ['shortcodeHead', 'shortcodeBody', 'shortcodeData'].map((funcName) => [
          `SHORTCODE_PREFIX_${funcName}`,
          `${prefix}_${funcName}`
        ])
      )
    };

    const content = Object.entries(substitutions).reduce(
      (content, [key, value]) => {
        return content.replace(new RegExp(key, 'g'), value);
      },
      fs.readFileSync(templatePath, 'utf-8')
    );

    const templateTarget = path.resolve(outdir, `${shortcode}.php`);

    fs.writeFileSync(templateTarget, content, { encoding: 'utf-8' });
  }

  return {
    name,
    config(config, env) {
      const isProduction = env.mode === 'production';
      if (!isProduction) return;

      const { plugins, ...rest } = config;

      config.build = {
        cssCodeSplit: true,
        ...config.build,
        lib: {
          entry,
          formats: ['es'],
          fileName: 'wordpress'
        },
        rollupOptions: {
          ...config.build?.rollupOptions,
          output: {
            assetFileNames: 'assets/[name]-[hash][extname]',
            chunkFileNames: 'chunks/[name]-[hash].js',
            entryFileNames: 'entires/[name]-[hash].js'
          }
        }
      };

      return rest;
    },
    configResolved(config) {
      _config = config;
      if (config.isProduction) return;

      const script = `<script type="module" src="${devUrl}/${main}"></script>`;

      writeTemplate(development, {
        SHORTCODE_SCRIPT: script
      });
    },
    generateBundle(options, bundle) {
      const { assets, chunks, entry } = Object.entries(bundle).reduce(
        (data, [key, value]) => {
          if (value.type === 'asset') {
            if (value.fileName.endsWith('.css')) {
              data.assets.push(value.fileName);
            }
            return data;
          }
          data.chunks.push(value.fileName);
          if (value.isEntry) {
            data.entry = value.fileName;
          }
          return data;
        },
        { assets: [] as string[], chunks: [] as string[], entry: undefined as undefined | string }
      );

      const css = assets
        .filter((x) => x.endsWith('.css'))
        .map((x) => `<link rel="stylesheet" href="${x}">`)
        .join('\n');
      const js = chunks
        .filter((x) => x.endsWith('.js'))
        .map((x) => `<link rel="modulepreload" href="${x}">`)
        .join('\n');

      const script = `
        <div style="display: contents">
            <script>          
              const attributes = JSON.parse('$\{jsonAttributes\}');
              const contents = '$\{contents\}';
              const target = document.currentScript.parentElement;
              await('${entry}').then(({default: startApp}) => startApp({
                  target,
                  attributes
                  contents,
                  shortcode: '${shortcode}'
                }));
            </script>  
          </div>
          `;

      writeTemplate(production, {
        SHORTCODE_SCRIPT: script,
        SHORTCODE_HEAD: [css, js].join('\n')
      });
    }
  };
}
