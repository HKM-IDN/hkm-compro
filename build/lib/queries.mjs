// GROQ query templates

export const SITE_SETTINGS_QUERY = `*[_type == "siteSettings"][0]{
  companyName,
  companyShortName,
  companyTagline,
  contactEmail,
  contactPhone,
  contactWhatsApp,
  contactAddress,
  contactHours,
  navLinks[]{ _key, label, url },
  marketplaceTokopedia,
  marketplaceShopee,
  marketplaceTiktok,
  socialInstagram,
  socialYoutube,
  socialLinkedin,
  footerColumns[]{ _key, heading, links[]{ _key, label, url } },
  footerCopyright,
  socialFeed{ enabled, mode, handle, lightwidgetId }
}`;

export const HOMEPAGE_QUERY = `*[_type == "homepage"][0]{
  heroEyebrow, heroTitle, heroDescription,
  heroCtaPrimary{ label, url },
  heroCtaSecondary{ label, url },

  categoriesSectionTitle, categoriesSectionDesc,
  categoriesToShow[]->{
    _id, name, slug, icon, description,
    "productCount": count(*[_type == "product" && references(^._id) && isActive == true])
  },

  spotlightSectionTitle,
  spotlightProducts[]->{
    _id, name, tagline, description, heroImage, slug,
    keyHighlights[]{ value, label, icon },
    marketplaceTokopedia, marketplaceShopee, marketplaceTiktok,
    "categorySlug": category->slug.current
  },

  youtubeSectionTitle, youtubeSectionDesc,
  youtubeFeatured{ url, customTitle, customDescription, customThumbnail },
  youtubeOthers[]{ url, customTitle, customDescription, customThumbnail },

  instagramSectionTitle, instagramHandle, instagramLightwidgetCode,

  newsSectionTitle, newsSectionDesc, newsAutoFetch,
  newsManualPicks[]->{
    _id, title, subtitle, slug, category, heroImage, publishedAt
  },

  serviceSectionTitle, serviceSectionDesc,
  "serviceStats": {
    "pointCount":    count(*[_type == "servicePoint" && isActive == true]),
    "provinceCount": count(array::unique(*[_type == "servicePoint" && isActive == true].province)),
    "cityCount":     count(array::unique(*[_type == "servicePoint" && isActive == true].city)),
    "regionCount":   count(array::unique(*[_type == "servicePoint" && isActive == true].region))
  },

  credibilityStats[]{ _key, value, label },

  partnersTitle,
  partners[]{ _key, name, logo, url },

  // Minimal coords for homepage map markers — fetched server-side so no client Sanity call needed.
  "servicePoints": *[_type == "servicePoint" && isActive == true] | order(isHeadOffice desc, name asc) {
    _id, name, isHeadOffice, coordinates { lat, lng }
  },

  b2bTitle, b2bDescription, b2bButtonLabel, b2bFormUrl
}`;

export const LATEST_NEWS_QUERY = `*[_type == "newsArticle" && isPublished == true] | order(publishedAt desc)[0..3]{
  _id, title, subtitle, slug, category, heroImage, publishedAt
}`;

export const PRODUCTS_PAGE_QUERY = `{
  "categories": *[_type == "productCategory" && isActive == true] | order(order asc) {
    _id, name, slug, icon,
    "productCount": count(*[_type == "product" && references(^._id) && isActive == true])
  },
  "products": *[_type == "product" && isActive == true] | order(category->order asc, order asc) {
    _id, name, brand, slug, heroImage, isFeatured,
    "categoryId": category->_id,
    "categorySlug": category->slug.current
  }
}`;

export const ABOUT_PAGE_QUERY = `*[_type == "aboutPage"][0]{
  heroEyebrow, heroTitle, heroDescription,
  stats[]{ value, label },
  storyEyebrow, storyHeadline, storyParagraphs,
  whyHeadline, whySubtitle,
  whyCards[]{ icon, title, description },
  ctaEyebrow, ctaTitle, ctaDescription,
  ctaButtons[]{ label, url, style }
}`;

export const CATEGORIES_SLUGS_QUERY = `*[_type == "productCategory" && isActive == true]{
  "slug": slug.current
}`;

export const SERVICE_POINT_SUMMARY_QUERY = `{
  "count": count(*[_type == "servicePoint" && isActive == true]),
  "regions": array::unique(*[_type == "servicePoint" && isActive == true].region)
}`;

export const SERVICE_POINTS_QUERY = `*[_type == "servicePoint" && isActive == true] | order(isHeadOffice desc, region asc, order asc) {
  _id, name, isHeadOffice, region, province, city, address,
  phone, whatsapp, email, hours, googleMapsUrl,
  coordinates { lat, lng }
}`;

// Fetches only the recruitment toggle — kept separate so it doesn't bloat
// the site-wide SITE_SETTINGS_QUERY used in every page layout.
export const PRODUCTS_FOR_CONTACT_QUERY = `*[_type == "product" && isActive == true] | order(name.en asc) {
  _id,
  name
}`;

export const SERVICE_PARTNER_RECRUITMENT_QUERY = `*[_type == "siteSettings"][0]{
  "servicePartnerRecruitment": servicePartnerRecruitment
}`;

export const PRODUCTS_SLUGS_QUERY = `*[_type == "product" && isActive == true]{
  "slug": slug.current,
  "category": category->slug.current
}`;

export const CAREERS_LISTING_QUERY = `*[_type == "jobPosting" && status != "closed"] | order(isUrgent desc, order asc, publishedAt desc) {
  _id, title, slug, department, location, employmentType, experienceRequired, publishedAt, isUrgent, status
}`;

export const CAREERS_SLUGS_QUERY = `*[_type == "jobPosting" && status != "closed"]{ "slug": slug.current }`;

export const CAREER_DETAIL_QUERY = `*[_type == "jobPosting" && slug.current == $slug][0]{
  _id, title, slug, department, location, employmentType, experienceRequired,
  aboutRole, responsibilities, requirements, niceToHave, benefits,
  applicationEmail, externalApplicationUrl,
  publishedAt, closingDate, status, isUrgent,
  "otherJobs": *[_type == "jobPosting" && status != "closed" && slug.current != $slug] | order(isUrgent desc, order asc)[0..2] {
    _id, title, slug, department, location, employmentType, experienceRequired
  }
}`;

export const NEWS_LISTING_QUERY = `{
  "featured": *[_type == "newsArticle" && isPublished == true && isFeatured == true] | order(publishedAt desc)[0] {
    _id, title, subtitle, slug, category, heroImage, publishedAt
  },
  "articles": *[_type == "newsArticle" && isPublished == true] | order(publishedAt desc) {
    _id, title, subtitle, slug, category, tags, heroImage, publishedAt, readTime, isFeatured
  }
}`;

export const NEWS_SLUGS_QUERY = `*[_type == "newsArticle" && isPublished == true]{ "slug": slug.current }`;

export const NEWS_ARTICLE_QUERY = `*[_type == "newsArticle" && slug.current == $slug && isPublished == true][0]{
  _id, title, subtitle, slug, category, tags, heroImage, publishedAt, readTime,
  body, bodyIndonesian,
  authorName, authorRole, authorBio, authorAvatar,
  "related": *[_type == "newsArticle" && isPublished == true && slug.current != $slug] | order(publishedAt desc)[0..2] {
    _id, title, slug, category, heroImage, publishedAt
  }
}`;

export const PRODUCT_DETAIL_QUERY = `*[_type == "product" && slug.current == $slug && category->slug.current == $category][0]{
  _id, name, modelNumber, brand, tagline, description,
  heroImage, gallery[]{ asset, hotspot, crop },
  heroVideo{ enabled, mp4Url, webmUrl, poster{ asset, hotspot, crop } },
  isFeatured, launchDate,
  keyHighlights[]{ value, label, icon },
  featureSections[]{
    title, description, imagePosition,
    media{ type, mp4Url, webmUrl, image{ asset, hotspot, crop }, poster{ asset, hotspot, crop } },
    image{ asset, hotspot, crop }
  },
  bundleValue{
    eyebrow, headline, description, ctaLabel, ctaUrl,
    items[]{ icon, label, value, caption }
  },
  connectivityVisualStyle,
  connectivity{
    eyebrow, headline,
    ports[]{ count, name, caption, shortLabel, highlighted }
  },
  specGroups[]{ groupName, rows[]{ label, value, footnote } },
  documentation{
    quickStart{ title, description, pdfUrl },
    fullManual{ title, description, pdfUrl },
    specSheet{ title, description, pdfUrl }
  },
  customerSupport{
    title, description,
    channels[]{ type, label, value, url },
    responseTime
  },
  warranty{
    period, description,
    findServicePointCta{ label, url },
    locations
  },
  faqs[]{ question, answer },
  marketplaceTokopedia, marketplaceShopee, marketplaceTiktok, priceRange,
  relatedProducts[]->{
    _id, name, brand, slug, heroImage, isFeatured,
    "categorySlug": category->slug.current
  },
  supportDocs[]{ title, fileUrl, type },
  "category": category->{ name, slug }
}`;

export const FEATURED_PRODUCTS_QUERY = `*[_type == "product" && isActive == true] | order(isFeatured desc, order asc)[0..2]{
  _id, name, brand, slug, heroImage, isFeatured,
  "categorySlug": category->slug.current
}`;

export const SITEMAP_PRODUCTS_QUERY = `*[_type == "product" && isActive == true]{
  "slug": slug.current,
  "category": category->slug.current,
  _updatedAt
}`;

export const SITEMAP_NEWS_QUERY = `*[_type == "newsArticle" && isPublished == true]{
  "slug": slug.current,
  publishedAt,
  _updatedAt
}`;

export const SITEMAP_CAREERS_QUERY = `*[_type == "jobPosting" && status != "closed"]{
  "slug": slug.current,
  _updatedAt
}`;

export const CATEGORY_PAGE_QUERY = `{
  "category": *[_type == "productCategory" && slug.current == $slug && isActive == true][0]{
    _id, name, slug, icon, description
  },
  "products": *[_type == "product" && category->slug.current == $slug && isActive == true] | order(isFeatured desc, order asc) {
    _id, name, brand, slug, heroImage, isFeatured, launchDate,
    keyHighlights[]{ value, label },
    marketplaceTokopedia, marketplaceShopee, marketplaceTiktok,
    "categorySlug": category->slug.current
  }
}`;
