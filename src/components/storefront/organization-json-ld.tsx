import { organizationSchemaJson } from "@/lib/site-metadata";

export function OrganizationJsonLd() {
  const json = organizationSchemaJson();
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
