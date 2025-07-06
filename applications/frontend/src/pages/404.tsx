import Layout from "@/components/Layout";
import { ArrowLeft, Home, Search } from "lucide-react";
import Link from "next/link";

export default function Custom404() {
  return (
    <Layout title="Seite nicht gefunden">
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="max-w-md mx-auto px-6">
          {/* Main Card */}
          <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/20 text-center transform hover:scale-[1.02] transition-all duration-300">
            {/* Animated 404 */}
            <div className="relative mb-8">
              <h1 className="text-8xl font-thin text-gray-300 select-none animate-pulse">404</h1>
              <div className="absolute inset-0 bg-gradient-to-r from-german-red via-german-gold to-german-red bg-clip-text text-transparent text-8xl font-thin animate-gradient-x">
                404
              </div>
            </div>

            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div className="p-4 bg-gray-100 rounded-full animate-bounce">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
            </div>

            {/* Text */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">Seite nicht gefunden</h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Die gesuchte Seite existiert nicht oder wurde verschoben.
            </p>

            {/* Buttons */}
            <div className="space-y-3">
              <Link
                href="/"
                className="group w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-german-red to-german-gold text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Zur Startseite
              </Link>

              <button
                onClick={() => window.history.back()}
                className="group w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl font-medium hover:bg-gray-50 hover:border-gray-300 transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Zurück
              </button>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-1/4 -left-4 w-2 h-2 bg-german-red rounded-full animate-ping opacity-30"></div>
          <div className="absolute bottom-1/3 -right-4 w-3 h-3 bg-german-gold rounded-full animate-pulse opacity-40"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-x {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </Layout>
  );
}
