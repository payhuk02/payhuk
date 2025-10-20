export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const getStoreDomain = (): string => {
  // Check if we're in development or production
  const hostname = window.location.hostname;
  
  // If custom domain is configured, return it
  // For development, return localhost
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return 'localhost:8080';
  }
  
  // For production with custom domain
  return hostname;
};

export const generateStoreUrl = (slug: string, customDomain?: string): string => {
  const domain = customDomain || getStoreDomain();
  const protocol = window.location.protocol;
  return `${protocol}//${slug}.${domain}`;
};

export const generateProductUrl = (storeSlug: string, productSlug: string, customDomain?: string): string => {
  const domain = customDomain || getStoreDomain();
  const protocol = window.location.protocol;
  return `${protocol}//${storeSlug}.${domain}/${productSlug}`;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};
