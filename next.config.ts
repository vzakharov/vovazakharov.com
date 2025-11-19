import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '',
  images: {
    unoptimized: true,
  },
};

export default withNextIntl(nextConfig);
