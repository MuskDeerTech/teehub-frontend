import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { getPage } from "@/lib/pages";
import { buildMetadata } from "@/lib/seo";

type Params = { slug: string };

// Pages query Payload/Postgres. Render at request time so deploys do not
// exhaust the database connection pool while collecting static params.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) return { title: "Page - TeeHub" };

  return buildMetadata({
    title: `${page.title} - TeeHub`,
    path: `/policies/${page.slug}`,
    seo: page.seo,
  });
}

export default async function PolicyPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) notFound();

  return (
    <main className="mx-auto w-full px-[clamp(16px,4vw,80px)] py-10">
      <h1 className="mb-6 text-[clamp(24px,3vw,36px)] font-extrabold uppercase tracking-tight text-[#111]">
        {page.title}
      </h1>
      <div className="policy-content">
        <RichText data={page.content as SerializedEditorState} />
      </div>
    </main>
  );
}
