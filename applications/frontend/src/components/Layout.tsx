import Head from "next/head";
import Link from "next/link";
import React from "react";
import InstallTip from "./InstallTip";
import MobileMenu from "./MobileMenu";

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
        <link rel="icon" href="/favicon.ico" />
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
                <div className="w-8 h-6 german-stripes rounded shadow-sm" />
                <Link
                  href="/"
                  className="text-xl font-bold text-german-black hover:text-german-red transition-colors"
                >
                  Demokratie Quiz
                </Link>
              </div>
              <MobileMenu />
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
                  Einzelspieler
                </Link>
                <Link
                  href="/lobby"
                  className="text-gray-700 hover:text-german-red font-medium transition-colors"
                >
                  Multiplayer
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
                <Link
                  href="/join"
                  className="text-gray-700 hover:text-german-red font-medium transition-colors"
                >
                  Lobby beitreten
                </Link>
                <Link
                  href="/why"
                  className="text-gray-700 hover:text-german-red font-medium transition-colors"
                >
                  Warum?
                </Link>
              </div>
            </div>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="bg-german-black text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-6 german-stripes rounded" />
                  <span className="text-xl font-bold">Demokratie Quiz</span>
                </div>
                <p className="text-gray-300 mb-4">
                  Stärke dein Verständnis für demokratische Werte durch interaktive Quizfragen.
                </p>
                <div className="text-sm text-gray-400">
                  <p className="mb-2">
                    Entwickelt von{" "}
                    <span className="text-german-gold font-medium">Zacklack Media - Cédric</span>
                  </p>
                  <p>Student Developer & Tech Enthusiast aus Berlin, Deutschland.</p>
                </div>
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
                <h3 className="text-lg font-semibold mb-4 text-german-gold">Links</h3>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="https://github.com/zzackllack/democratic-politics-quiz"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-german-gold transition-colors flex items-center space-x-2"
                    >
                      <span>GitHub Repository</span>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                      </svg>
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://zacklack.de"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-german-gold transition-colors"
                    >
                      Hauptseite
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://privat.zacklack.de"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-german-gold transition-colors"
                    >
                      Login
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://dash.zacklack.de"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-german-gold transition-colors"
                    >
                      Server Konsole
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 text-german-gold">Rechtliches</h3>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="https://legal.zacklack.de/impressum/"
                      className="text-gray-300 hover:text-german-gold transition-colors"
                    >
                      Impressum
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://legal.zacklack.de/datenschutz/"
                      className="text-gray-300 hover:text-german-gold transition-colors"
                    >
                      Datenschutzerklärung
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://legal.zacklack.de/nutzungsbedingungen/"
                      className="text-gray-300 hover:text-german-gold transition-colors"
                    >
                      Nutzungsbedingungen
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://legal.zacklack.de/cookies/"
                      className="text-gray-300 hover:text-german-gold transition-colors"
                    >
                      Cookie-Richtlinie
                    </a>
                  </li>
                </ul>
                <div className="mt-4 text-sm text-gray-400">
                  <p>
                    Diese Seite ist Open Source auf{" "}
                    <a
                      href="https://github.com/zzackllack/democratic-politics-quiz"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-german-gold hover:underline"
                    >
                      GitHub
                    </a>
                  </p>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
              <p>&copy; 2025 Zacklack Media - Cédric. Alle Rechte vorbehalten.</p>
              <p className="mt-1">Demokratie Quiz - Bildung für die Demokratie.</p>
            </div>
          </div>
        </footer>
        <InstallTip />
      </div>
    </>
  );
}
