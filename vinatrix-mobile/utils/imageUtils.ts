// Base64 SVG fallback (no local file needed)
export const FALLBACK_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgNDAwIDQwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiNmNWY1ZjUiLz48dGV4dCB4PSIyMDAiIHk9IjIwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+";

export const isValidImageUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  if (url.includes("via.placeholder.com")) return false;
  if (url.includes("No+Image")) return false;
  if (url.includes("null") || url.includes("undefined")) return false;
  return true;
};

export const getSafeImageUrl = (url: string | null | undefined): string => {
  if (isValidImageUrl(url)) {
    return url as string;
  }
  return FALLBACK_IMAGE;
};

export const getImageSource = (url: string | null | undefined) => {
  return { uri: getSafeImageUrl(url) };
};
