import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const navItems = [
  { href: "/", label: "Startseite" },
  { href: "/play", label: "Quiz" },
  { href: "/leaderboard", label: "Bestenliste" },
  { href: "/reflection", label: "Reflexion" },
];

const MobileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 rounded-lg text-gray-700 hover:text-german-red hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-german-red/20 transition-all duration-200"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 backdrop-blur-md z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              onClick={() => setIsOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 w-80 bg-white/95 backdrop-blur-xl shadow-2xl z-50 border-r border-gray-100"
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
                duration: 0.4,
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-6 german-stripes rounded shadow-sm" />
                  <span className="text-xl font-bold bg-gradient-to-r from-german-black via-german-red to-german-gold bg-clip-text text-transparent">
                    Menu
                  </span>
                </div>
                <motion.button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-gray-500 hover:text-german-red hover:bg-gray-50 focus:outline-none transition-all duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              {/* Navigation */}
              <nav className="flex flex-col px-6 py-8 space-y-2">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.1 + index * 0.1,
                      duration: 0.4,
                      ease: "easeOut",
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="group relative block px-4 py-4 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-german-red/5 hover:to-german-gold/5"
                    >
                      <motion.span
                        className="text-2xl font-semibold text-gray-800 group-hover:text-german-red transition-colors duration-300"
                        whileHover={{ x: 8 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        {item.label}
                      </motion.span>
                      <motion.div
                        className="absolute bottom-2 left-4 h-0.5 bg-gradient-to-r from-german-red to-german-gold rounded-full"
                        initial={{ width: 0 }}
                        whileHover={{ width: "80%" }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      />
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Footer */}
              <motion.div
                className="absolute bottom-6 left-6 right-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                <div className="text-center p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
                  <p className="text-sm text-gray-600 font-medium">Demokratie Quiz</p>
                  <p className="text-xs text-gray-500 mt-1">Bildung für die Demokratie</p>
                </div>
              </motion.div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileMenu;
