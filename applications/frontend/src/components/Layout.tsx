import React from "react";
import Head from "next/head";
import Link from "next/link";

interface LayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export default function Layout({
  title,
  description = "Demokratie Quiz - Stärke dein Verständnis für demokratische Werte",
  children,
}: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" />
        <meta name="apple-mobile-web-app-title" content="Quiz" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="min-h-screen flex flex-col">
        <header className="bg-white shadow-sm border-b-2 border-german-gold sticky top-0 z-50">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Link
                  href="/"
                  className="flex items-center space-x-2 text-xl font-bold text-german-black hover:text-german-red transition-colors"
                >
                  <div className="w-8 h-6 german-stripes rounded" />
                  <span>Demokratie Quiz</span>
                </Link>
              </div>
              <div className="hidden md:flex items-center space-x-6">
                <Link
                  href="/"
                  className="text-gray-700 hover:text-german-red font-medium transition-colors"
                >
                  Startseite
                </Link>
                <Link
                  href="/play"
                  className="text-gray-700 hover:text-german-red font-medium transition-colors"
                >
                  Quiz
                </Link>
                <Link
                  href="/leaderboard"
                  className="text-gray-700 hover:text-german-red font-medium transition-colors"
                >
                  Bestenliste
                </Link>
                <Link
                  href="/reflection"
                  className="text-gray-700 hover:text-german-red font-medium transition-colors"
                >
                  Reflexion
                </Link>
              </div>
            </div>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="bg-german-black text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-6 german-stripes rounded" />
                  <span className="text-xl font-bold">Demokratie Quiz</span>
                </div>
                <p className="text-gray-300">
                  Stärke dein Verständnis für demokratische Werte durch interaktive Quizfragen.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 text-german-gold">Navigation</h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/"
                      className="text-gray-300 hover:text-german-gold transition-colors"
                    >
                      Startseite
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/play"
                      className="text-gray-300 hover:text-german-gold transition-colors"
                    >
                      Quiz
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/leaderboard"
                      className="text-gray-300 hover:text-german-gold transition-colors"
                    >
                      Bestenliste
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/reflection"
                      className="text-gray-300 hover:text-german-gold transition-colors"
                    >
                      Reflexion
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 text-german-gold">Über das Projekt</h3>
                <p className="text-gray-300 text-sm">
                  Dieses Quiz wurde entwickelt, um das Verständnis für demokratische Prozesse und
                  Werte zu fördern.
                </p>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
              <p>&copy; 2025 Demokratie Quiz. Bildung für die Demokratie.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
