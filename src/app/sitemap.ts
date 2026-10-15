import { MetadataRoute } from 'next';
import { COURSES } from '@/data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://seva-skill-passport.vercel.app';
  const lastModified = new Date();

  // Public indexable static routes
  const staticRoutes = [
    '',
    '/courses',
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
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : route === '/courses' ? 0.9 : 0.7,
  }));

  // Public course pages
  const courseRoutes = COURSES.map((course) => ({
    url: `${baseUrl}/courses/${course.id}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...courseRoutes];
}
