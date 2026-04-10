export default function CodingLayout({ children }) {
  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
