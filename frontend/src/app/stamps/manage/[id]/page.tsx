"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ManageRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const stampId = params.id;

  useEffect(() => {
    if (stampId) {
      // Set a session storage flag to verify access
      // Using a unique key per stamp ID to prevent cross-stamp access issues
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`stamp_access_${stampId}`, 'true');
      }
      // Redirect to acquire page without query parameters
      router.replace(`/stamps/acquire/${stampId}`);
    }
  }, [stampId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-xl font-bold text-gray-700 mb-2">Redirecting...</h1>
        <p className="text-gray-500">Please wait while we redirect you to the stamp acquisition page.</p>
      </div>
    </div>
  );
}
