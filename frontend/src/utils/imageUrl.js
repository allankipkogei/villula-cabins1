export function getImageUrl(url) {
  if (!url) return '/placeholder-cabin.svg';

  // 1. If it's a Cloudinary URL, inject optimization parameters
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    // f_auto: Automatically serves WebP/AVIF (much smaller file size)
    // q_auto: Automatically compresses the image without losing noticeable quality
    // w_1200: Resizes the image so it's never wider than 1200px
    return url.replace('/upload/', '/upload/f_auto,q_auto,w_1200/');
  }

  // 2. If it's already an absolute URL, return it as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // 3. Fallback for local development
  if (url.startsWith('/media/')) {
    return `http://127.0.0.1:8000${url}`;
  }

  return url;
}