import React from "react";
import { Helmet as ReactHelmet } from "react-helmet";

interface HelmetProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
}

export const Helmet: React.FC<HelmetProps> = ({
  title = "MarrakechDeserts - Authentic Moroccan Desert Tours",
  description = "Experience authentic Moroccan desert tours with MarrakechDeserts. Book hot air balloon rides, desert excursions, and day trips from Marrakech at affordable prices.",
  canonicalUrl,
  ogImage = "https://images.unsplash.com/photo-1489493585363-d69421e0edd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=630",
}) => {
  return (
    <ReactHelmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:type" content="website" />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
    </ReactHelmet>
  );
};

export default Helmet;
