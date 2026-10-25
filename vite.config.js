import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Vite сам минифицирует стили и скрипт, но не HTML.
// Этот маленький плагин при сборке убирает из index.html комментарии и лишние пробелы.
// Пробелы сворачиваются до одного, а не удаляются совсем, чтобы не склеить слова между тегами.
function minifyHtml() {
  return {
    name: 'gramma-minify-html',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler: (html) => html
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/\s+/g, ' ')
        .trim(),
    },
  };
}

export default defineConfig({
  // относительные пути: сайт работает и по адресу shuga-coding.github.io/gramma/, и на своём домене
  base: './',
  build: {
    outDir: 'dist',
    // картинки лежат в public/img и копируются как есть; встраивать их в код не нужно
    assetsInlineLimit: 0,
    // страницы: главная, памятка по уходу (/guide/) и подарочный сертификат (/gift/)
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        guide: resolve(__dirname, 'guide/index.html'),
        gift: resolve(__dirname, 'gift/index.html'),
      },
    },
  },
  plugins: [minifyHtml()],
});
