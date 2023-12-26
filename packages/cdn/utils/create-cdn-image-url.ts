const URL_IMAGE_TRANSFORMATION = "t_url_image";

export const createCdnImageUrl = (baseImageUrl: string) => {
  // I suck at regexp, so ...
  // Replacing vXXXXXXXXXX with transformation
  // E.g. // https://res.cloudinary.com/urlshare/image/upload/v1703166971/url/icon-url_bLVuC6HggnFbNfARPTfT9.png
  const [leftPart, rightPart] = baseImageUrl.split("/upload/");
  const [_, ...rest] = rightPart.split("/");

  return `${leftPart}/upload/${URL_IMAGE_TRANSFORMATION}/${rest.join("/")}`;
};
