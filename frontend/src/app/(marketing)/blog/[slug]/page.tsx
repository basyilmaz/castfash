interface Params {
  params: { slug: string };
}

export default function BlogDetailPage({ params }: Params) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 text-white">
      <h1 className="text-3xl font-semibold mb-4">Blog: {params.slug}</h1>
      <p className="text-textMuted">Blog detay sayfası (WIP).</p>
    </div>
  );
}
