import { articles as staticArticles, type Article } from "../data/articles";
import {
  getVehicleBySlug as getStaticVehicleBySlug,
  vehicles as staticVehicles,
  type Vehicle,
} from "../data/vehicles";
import { connection } from "next/server";
import {
  pendingPolicies,
  type LegalResource,
  type LegalResourceType,
} from "../data/legal-resources";

const apiBaseUrl =
  process.env.CONTENT_API_URL ?? "http://localhost:4000/api/v1";

export async function getPublicVehicles(): Promise<Vehicle[]> {
  const response = await requestContentApi("/vehicles");
  if (!response) return staticVehicles;
  if (!response.ok) {
    throw new Error(
      `Content API returned ${response.status} while loading vehicles.`,
    );
  }
  return (await response.json()) as Vehicle[];
}

export async function getPublicVehicle(
  slug: string,
): Promise<Vehicle | undefined> {
  const response = await requestContentApi(
    `/vehicles/${encodeURIComponent(slug)}`,
  );
  if (!response) return getStaticVehicleBySlug(slug);
  if (response.status === 404) return undefined;
  if (!response.ok) {
    throw new Error(
      `Content API returned ${response.status} while loading a vehicle.`,
    );
  }
  return (await response.json()) as Vehicle;
}

export async function getPublicArticles(): Promise<Article[]> {
  const response = await requestContentApi("/articles");
  if (!response) return staticArticles;
  if (!response.ok) {
    throw new Error(
      `Content API returned ${response.status} while loading articles.`,
    );
  }
  return (await response.json()) as Article[];
}

export async function getPublicArticle(
  slug: string,
): Promise<Article | undefined> {
  const response = await requestContentApi(
    `/articles/${encodeURIComponent(slug)}`,
  );
  if (!response) return staticArticles.find((article) => article.slug === slug);
  if (response.status === 404) return undefined;
  if (!response.ok) {
    throw new Error(
      `Content API returned ${response.status} while loading an article.`,
    );
  }
  return (await response.json()) as Article;
}

export async function getPublicLegalResources(
  resourceType: LegalResourceType,
): Promise<LegalResource[]> {
  const response = await requestContentApi(
    `/legal-resources?type=${encodeURIComponent(resourceType)}`,
  );
  if (!response) {
    return resourceType === "policy" ? pendingPolicies : [];
  }
  if (!response.ok) {
    throw new Error(
      `Content API returned ${response.status} while loading legal resources.`,
    );
  }
  return (await response.json()) as LegalResource[];
}

async function requestContentApi(path: string) {
  await connection();
  try {
    return await fetch(`${apiBaseUrl}${path}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });
  } catch (error) {
    console.error(
      "Content API is unavailable; using the bundled sample content.",
      error,
    );
    return null;
  }
}
