import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";
import { PageTransition, motion } from "@/components/motion";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <PageTransition>
      <div className="min-h-screen pb-24">
        <div className="container flex min-h-[70vh] items-center justify-center">
          <motion.div
            className="surface-panel bg-background/80 p-10 text-center max-w-lg"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <motion.div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-foreground text-background"
              animate={{ rotate: [0, 10, -10, 5, -5, 0] }}
              transition={{ duration: 1.5, delay: 0.3, ease: "easeInOut" }}
            >
              <Compass className="h-7 w-7" />
            </motion.div>
            <motion.p
              className="text-6xl font-bold text-primary"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
            >
              404
            </motion.p>
            <h1 className="mt-3 text-3xl font-display">We couldn't find that page</h1>
            <p className="mt-3 text-muted-foreground">
              The link may be broken, or the page may have moved. Start a fresh route below.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button asChild>
                  <Link to="/">Back to home</Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button variant="outline" asChild>
                  <Link to="/breakfast">Browse recipes</Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default NotFound;
