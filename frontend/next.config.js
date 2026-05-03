/** @type {import('next').NextConfig} */
const nextConfig = {
  // Desativa a pré-renderização estática para evitar erros de variáveis de ambiente no build
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
