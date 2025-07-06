import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { ArrowRight, Code, Heart, Target, Users } from "lucide-react";

export default function WhyPage() {
  return (
    <Layout title="Warum gibt es dieses Quiz?">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
        {/* Hintergrund-Elemente */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-black/5 to-transparent" />
          <div className="absolute top-1/3 left-0 w-full h-1/3 bg-gradient-to-b from-red-600/5 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-yellow-400/10 to-transparent" />

          <motion.div
            className="absolute top-20 right-20 w-32 h-24 rounded-lg blur-xl bg-gradient-to-b from-black via-red-600 to-yellow-400"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.2, scale: 1 }}
            transition={{ duration: 1.5 }}
          />
          <motion.div
            className="absolute bottom-32 left-20 w-20 h-20 rounded-lg blur-xl bg-gradient-to-b from-black via-red-600 to-yellow-400"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.15, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.3 }}
          />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-12">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* Header */}
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-german-red to-german-gold flex items-center justify-center shadow-lg"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Heart className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-4xl md:text-6xl font-bold text-german-black mb-6">
                Warum gibt es dieses Quiz?
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Dieses Quiz wurde im Rahmen des Politik-Grundkurses unseres Gymnasiums von uns ins
                Leben gerufen, um demokratische Werte anschaulich zu vermitteln und das
                Demokratieverständnis zu stärken.
              </p>
            </motion.div>

            <div className="space-y-12">
              {/* Hintergrund & Ziele */}
              <motion.div
                className="bg-white rounded-2xl shadow-xl p-8 md:p-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex items-center mb-6">
                  <motion.div
                    className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  >
                    <Target className="w-6 h-6 text-blue-600" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-german-black">Hintergrund & Ziele</h2>
                </div>
                <div className="text-gray-700 leading-relaxed space-y-4">
                  <p className="text-lg">
                    Im Politik-Grundkurs wurde uns die Aufgabe gestellt, ein Projekt bzw. ein Spiel
                    zu entwickeln (analog oder digital), dass demokratische Grundwerte vermittelt
                    und das Demokratieverständnis stärkt. Wir entschieden uns bewusst für ein
                    digitales Format, das wir auch außerhalb des Unterrichts umgesetzt und
                    kontinuierlich weiterentwickelt haben.
                  </p>
                  <p>
                    Unser vorheriges Projekt, umgesetzt vor etwa dreiviertel Jahr, fokussierte auf
                    die Unterscheidung rechtsextremer Parteien (AfD vs. NSDAP) in einem digitalen
                    Quiz mit Zitatzuordnung und einer einfachen MySQL-Datenbank. Aufbauend darauf
                    haben wir dieses Konzept erweitert, einen Multiplayer-Modus hinzugefügt und
                    modernere Technologien integriert. Das alte Quiz ist noch unter{" "}
                    <a
                      href="https://old-quiz.zacklack.de/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      old-quiz.zacklack.de
                    </a>{" "}
                    verfügbar.
                  </p>
                  <p>
                    Ziel ist es, durch interaktive Fragen und Reflexion ein tieferes Verständnis
                    demokratischer Prozesse und Werte wie Freiheit, Gleichheit und Solidarität zu
                    fördern.
                  </p>
                </div>
              </motion.div>

              {/* Team & Rollen */}
              <motion.div
                className="bg-white rounded-2xl shadow-xl p-8 md:p-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="flex items-center mb-6">
                  <motion.div
                    className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                  >
                    <Users className="w-6 h-6 text-purple-600" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-german-black">
                    Team & Rollen & Danksagungen
                  </h2>
                </div>
                <div className="text-gray-700 leading-relaxed space-y-4">
                  <p className="text-lg">
                    <strong>Cedric</strong> ist verantwortlich für die technische Architektur und
                    Implementierungsentscheidungen. <strong>Erik</strong>, <strong>Emil</strong> und{" "}
                    <strong>Anton</strong> haben die Quizfragen recherchiert und erstellt sowie das
                    Projekt konzeptionell begleitet. Danke auch an alle weiteren die das Quiz auf
                    Herz und Nieren getestet haben und uns wertvolles Feedback gegeben haben.
                    Besonders danken wir <strong>Nikolas</strong> für das kritische Feedback
                    bezüglich der Backend-Architektur und der Datenbank-Integration.
                  </p>
                  <p>
                    Schon beim ersten Quiz-Projekt wünschten sich viele Nutzer zusätzliche
                    Funktionen. Diese Wünsche haben wir in der aktuellen Version bestmöglich
                    umgesetzt und die Plattform weiterentwickelt.
                  </p>
                </div>
              </motion.div>

              {/* Tech-Stack & Tools */}
              <motion.div
                className="bg-white rounded-2xl shadow-xl p-8 md:p-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <div className="flex items-center mb-6">
                  <motion.div
                    className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                  >
                    <Code className="w-6 h-6 text-orange-600" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-german-black">Tech-Stack & Tools</h2>
                </div>
                <div className="text-gray-700 leading-relaxed space-y-2">
                  <ul className="list-disc list-inside space-y-1">
                    <li>React 19 & Next.js 15 & Tailwind CSS 4 (Frontend)</li>
                    <li>Framer Motion (Animationen)</li>
                    <li>Lucide-React (Icons)</li>
                    <li>Google Fonts (Typografie)</li>
                    <li>PWA-Unterstützung</li>
                    <li>Express.js + Joi (Backend, Validierung)</li>
                    <li>Prisma ORM & PostgreSQL (Datenbank)</li>
                    <li>ESLint & Prettier (Code-Qualität)</li>
                    <li>Docker (Backend-Deployment)</li>
                    <li>Traefik + Caddy (Reverse Proxy)</li>
                    <li>Git + GitHub (Versionskontrolle)</li>
                    <li>Codex + GitHub Copilot (KI-gestützte Code-Vervollständigung)</li>
                    <li>Cloudflare (CDN)</li>
                    <li>Cloudflare Workers & Pages (Frontend-Deployment)</li>
                  </ul>
                </div>
              </motion.div>

              {/* Call to Action */}
              <motion.div
                className="text-center bg-gradient-to-r from-german-red to-german-gold rounded-2xl p-12 text-white"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <h2 className="text-3xl font-bold mb-6">Jetzt mitmachen</h2>
                <p className="text-xl mb-8 opacity-90">
                  Probiert unser Quiz aus, teilt eure Erfahrungen und helft, Demokratiebildung
                  weiter zu verbessern.
                </p>
                <motion.a
                  href="/play"
                  className="inline-block px-8 py-4 bg-white text-german-black font-bold rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Quiz starten
                  <ArrowRight className="inline w-5 h-5 ml-2" />
                </motion.a>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
