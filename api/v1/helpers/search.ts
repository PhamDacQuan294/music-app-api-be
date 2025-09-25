import { convertToSlug } from "./convertToSlug";

interface ObjectSearch {
  keyword: string;
  keywordRegex?: RegExp;
  stringSlugRegex?: RegExp;
}

export const objectSearh = (query: any): ObjectSearch => {
  if (query.keyword) {
    const keyword = `${query.keyword}`;
    const keywordRegex = new RegExp(keyword, "i");

    // Tạo ra slug không dấu, có thêm dấu - ngăn cách
    const stringSlug = convertToSlug(keyword);
    const stringSlugRegex = new RegExp(stringSlug, "i");

    return {
      keyword,
      keywordRegex,
      stringSlugRegex
    };
  };
}