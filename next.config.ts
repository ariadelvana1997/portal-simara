/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: true, // Gunakan true agar browser mengingat pengalihan ini
      },
    ]
  },
};

export default nextConfig;