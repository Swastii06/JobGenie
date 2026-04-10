import { Suspense } from "react";
import { BarLoader } from "react-spinners";

// Force dynamic rendering - prevent static generation of child routes with Clerk headers
export const dynamic = 'force-dynamic';

export default function Layout({ children }) {
  return (
    <div className="px-5">
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="gray" />}
      >
        {children}
      </Suspense>
    </div>
  );
}