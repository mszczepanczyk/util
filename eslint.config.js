import config from '@mariusz.sh/eslint-config';

if (process.env.NODE_ENV !== 'production') {
  // Make all rules warn only
  await import('eslint-plugin-only-warn');
}

export default [...config];
