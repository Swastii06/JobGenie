// Force dynamic rendering - prevent static generation of child routes with Clerk headers
export const dynamic = 'force-dynamic';

export default function CodingLayout({ children }) {
  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
