import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://seva-skill-passport.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/courses',
        '/courses/',
        '/credentials',
        '/verify',
        '/about',
        '/how-it-works',
        '/employers',
        '/faq',
        '/contact',
        '/privacy',
        '/terms',
        '/refund',
        '/cookies',
      ],
      disallow: [
        '/dashboard/',
        '/my-learning/',
        '/learning/',
        '/practice/',
        '/assessments/',
        '/projects/',
        '/skill-growth/',
        '/skill-passport/my/',
        '/profile/',
        '/admin/',
        '/api/',
        '/onboarding/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
