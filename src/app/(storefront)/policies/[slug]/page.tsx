import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { getPage } from "@/lib/pages";

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

  return {
    title: page ? `${page.title} - TeeHub` : "Page - TeeHub",
  };
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
    <main className="mx-auto w-full max-w-[860px] px-[clamp(16px,4vw,40px)] py-12 max-[480px]:py-8">
      <h1 className="mb-6 text-[28px] font-bold uppercase tracking-[0.5px] text-[#111] max-[480px]:text-[22px]">
        {page.title}
      </h1>
      <div className="policy-content">
        <RichText data={page.content as SerializedEditorState} />
      </div>
    </main>
  );
}
