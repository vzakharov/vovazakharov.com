import type { Metadata } from "next";
import { SITE_CONFIG, getAbsoluteUrl } from "@/lib/site-config";

const description = "Full-stack developer with deep AI/ML expertise since 2019. Building practical LLM-powered tools, prototypes, and production systems.";

const longDescription = `${description} Physics-math brain meets low-maintenance execution.`;

const title = `CV - ${SITE_CONFIG.name}`;

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description: longDescription,
    url: getAbsoluteUrl("/cv"),
    type: "profile",
    images: [
      {
        url: getAbsoluteUrl(SITE_CONFIG.avatar.path),
        width: SITE_CONFIG.avatar.width,
        height: SITE_CONFIG.avatar.height,
        alt: SITE_CONFIG.name,
      },
    ],
  },
  twitter: {
    card: "summary",
    title,
    description,
    images: [getAbsoluteUrl(SITE_CONFIG.avatar.path)],
  },
};

export { default } from "./CVPage";