import { SITE_CONFIG } from "@/lib/site-config";
import { constructMetadata } from "@/lib/metadata";

const description = "Full-stack developer with deep AI/ML expertise since 2019. Building practical LLM-powered tools, prototypes, and production systems.";

export const metadata = constructMetadata({
  title: `CV - ${SITE_CONFIG.name}`,
  description,
  ogDescription: `${description} Physics-math brain meets low-maintenance execution.`,
  path: "/cv",
  ogType: "profile",
});

export { default } from "./CVPage";