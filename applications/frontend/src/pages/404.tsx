import Layout from "@/components/Layout";
import Link from "next/link";

export default function Custom404() {
  return (
    <Layout title="Seite nicht gefunden">
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <h1 className="text-6xl font-bold text-german-red mb-4">404</h1>
          <p className="text-xl text-gray-700 mb-6">Diese Seite konnte nicht gefunden werden.</p>
          <Link
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-german-red to-german-gold text-white rounded-lg"
          >
            Zur Startseite
          </Link>
        </div>
      </div>
    </Layout>
  );
}
