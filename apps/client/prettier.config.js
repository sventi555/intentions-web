import config from '../../prettier.config.js';

export default {
  ...config,
  plugins: [...config.plugins, 'prettier-plugin-tailwindcss'],
};
