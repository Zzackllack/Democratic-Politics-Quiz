import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Share, MoreHorizontal, Smartphone, X } from "lucide-react";

const isIOS = () => {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && window.innerWidth < 820;
};

const isAndroid = () => {
  if (typeof window === "undefined") return false;
  return /android/i.test(navigator.userAgent) && window.innerWidth < 820;
};

const isInStandaloneMode = () =>
  typeof window !== "undefined" &&
  (window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone);

export default function InstallTip() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = sessionStorage.getItem("install-tip-dismissed");
    if (dismissed) return;
    if (!isInStandaloneMode() && (isIOS() || isAndroid())) {
      setVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    sessionStorage.setItem("install-tip-dismissed", "true");
  };

  const ios = isIOS();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
        >
          <div
            className="m-4 flex max-w-md items-start space-x-3 rounded-lg bg-white p-4 shadow-lg pointer-events-auto"
            role="dialog"
            aria-label="Install instructions"
          >
            <div className="flex-shrink-0 mt-1 text-german-black">
              {ios ? (
                <Share size={24} />
              ) : (
                <div className="flex space-x-1">
                  <MoreHorizontal size={24} />
                  <Smartphone size={24} />
                </div>
              )}
            </div>
            <p className="text-sm text-gray-700 flex-1">
              {ios ? (
                <>
                  Tippe auf <span className="font-semibold">Teilen</span> und wähle{" "}
                  <span className="font-semibold">Zum Home-Bildschirm</span> aus
                </>
              ) : (
                <>
                  Tippe auf das <span className="font-semibold">Menü</span> und dann auf{" "}
                  <span className="font-semibold">App installieren</span>
                </>
              )}
            </p>
            <button
              aria-label="Dismiss"
              onClick={handleDismiss}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
