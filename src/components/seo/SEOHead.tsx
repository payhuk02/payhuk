import React from 'react';
import { Helmet } from 'react-helmet';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  locale?: string;
  siteName?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterSite?: string;
  twitterCreator?: string;
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

/**
 * Composant SEO optimisé pour toutes les pages
 * Gère les meta tags, Open Graph, Twitter Cards, et Schema.org
 */
export const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'Payhuk - Plateforme de E-commerce Africaine',
  description = 'Payhuk est la première plateforme de e-commerce dédiée à l\'Afrique. Vendez et achetez en toute sécurité avec nos solutions de paiement locales.',
  keywords = ['e-commerce', 'Afrique', 'paiement', 'monnaie locale', 'boutique en ligne', 'marketplace'],
  image = '/images/og-image.jpg',
  url,
  type = 'website',
  author = 'Payhuk',
  publishedTime,
  modifiedTime,
  locale = 'fr_FR',
  siteName = 'Payhuk',
  twitterCard = 'summary_large_image',
  twitterSite = '@payhuk',
  twitterCreator = '@payhuk',
  canonical,
  noindex = false,
  nofollow = false,
}) => {
  const fullTitle = title.includes('Payhuk') ? title : `${title} | Payhuk`;
  const fullUrl = url ? `${process.env.VITE_APP_URL || 'https://payhuk.com'}${url}` : undefined;
  const fullImage = image.startsWith('http') ? image : `${process.env.VITE_APP_URL || 'https://payhuk.com'}${image}`;
  const canonicalUrl = canonical || fullUrl;

  // Schema.org structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type === 'product' ? 'Product' : type === 'article' ? 'Article' : 'WebSite',
    name: fullTitle,
    description,
    url: fullUrl,
    image: fullImage,
    author: type === 'article' ? { '@type': 'Person', name: author } : undefined,
    publisher: {
      '@type': 'Organization',
      name: siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.VITE_APP_URL || 'https://payhuk.com'}/images/logo.png`,
      },
    },
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    inLanguage: locale,
    ...(type === 'WebSite' && {
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${process.env.VITE_APP_URL || 'https://payhuk.com'}/marketplace?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    }),
  };

  return (
    <Helmet>
      {/* Meta tags de base */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={author} />
      <meta name="robots" content={`${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}`} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="fr" />
      <meta name="language" content="French" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />

      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}

      {/* Twitter Cards */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content={twitterSite} />
      <meta name="twitter:creator" content={twitterCreator} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      {/* Mobile optimizations */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Payhuk" />
      <meta name="application-name" content="Payhuk" />
      <meta name="msapplication-TileColor" content="#1e40af" />
      <meta name="theme-color" content="#1e40af" />

      {/* Favicon */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />

      {/* Preconnect pour les performances */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://api.moneroo.io" />
      <link rel="preconnect" href="https://cdn.jsdelivr.net" />

      {/* DNS prefetch */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//api.moneroo.io" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEOHead;
