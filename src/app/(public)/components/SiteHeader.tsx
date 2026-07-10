import { getCachedCategories } from "./getCachedCategories";
import SiteHeaderClient from "./SiteHeaderClient";

export default async function SiteHeader() {
  const categories = await getCachedCategories();

  return <SiteHeaderClient categories={categories} />;
}
