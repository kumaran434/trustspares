
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description?: string;
  type?: string;
  image?: string;
  keywords?: string[]; // Added Keywords Prop
}

const SEO: React.FC<SEOProps> = ({ title, description, type = 'website', image, keywords }) => {
  const siteName = "TrustSpares";
  const defaultDesc = "A secure escrow platform for mobile technicians to buy and sell spares without fear of fraud.";
  const defaultImage = "https://cdn-icons-png.flaticon.com/512/2438/2438078.png"; 
  
  // Default keywords for the platform
  const defaultKeywords = ["Mobile Spares", "Technician Market", "Display Combo", "Original Spares", "TrustSpares", "Mobile Folder", "Wholesale Mobile Parts"];
  
  const finalKeywords = keywords && keywords.length > 0 
      ? [...keywords, ...defaultKeywords].join(", ") 
      : defaultKeywords.join(", ");

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{title} | {siteName}</title>
      <meta name="description" content={description || defaultDesc} />
      <meta name="keywords" content={finalKeywords} />
      
      {/* Open Graph / Facebook / WhatsApp Preview */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description || defaultDesc} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:image" content={image || defaultImage} />
      <meta property="og:image:alt" content={title} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description || defaultDesc} />
      <meta name="twitter:image" content={image || defaultImage} />
      
      {/* Google Bot Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
    </Helmet>
  );
};

export default SEO;
