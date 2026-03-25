import Link from "next/link";

const tools = [
  {
    name: "The Secret Ingredient",
    description: "A family recipe vault.",
    href: "/the-secret-ingredient",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fafafa] text-[#111111]">
      <header className="border-b border-black/10 px-6 py-5 max-w-5xl mx-auto w-full">
        <span className="text-lg font-semibold tracking-tight">ryangriffin.dev</span>
      </header>

      <section className="max-w-5xl mx-auto px-6 pt-24 pb-16">
        <h1 className="text-5xl font-bold tracking-tight mb-4">Tools</h1>
        <p className="text-black/40 text-lg mb-16">
          A collection of tools I&apos;ve built.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group border border-black/10 rounded-xl p-6 hover:border-garnet transition-colors duration-200"
            >
              <h2 className="font-semibold text-lg mb-2 group-hover:text-garnet transition-colors duration-200">
                {tool.name}
              </h2>
              <p className="text-black/40 text-sm leading-relaxed">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
