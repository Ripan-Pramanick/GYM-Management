export const instant = false;

import { notFound } from "next/navigation";

export default async function ClassDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  if (!resolvedParams?.slug) {
    notFound();
  }

  const className = resolvedParams.slug.charAt(0).toUpperCase() + resolvedParams.slug.slice(1);

  return (
    <div className="min-h-screen pt-32 pb-20 px-4">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          {className.replace('-', ' ')}
        </h1>
        <p className="text-brand-gray text-xl max-w-2xl mx-auto mb-12">
          Class details and booking system will be available here.
        </p>
      </div>
    </div>
  );
}