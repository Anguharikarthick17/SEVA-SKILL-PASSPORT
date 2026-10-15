/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/passport',
        destination: '/skill-passport/my',
        permanent: false,
      },
      {
        source: '/passport/my',
        destination: '/skill-passport/my',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
