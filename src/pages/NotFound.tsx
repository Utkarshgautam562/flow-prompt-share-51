
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="text-center space-y-6 px-4">
        <div className="bg-gradient-to-r from-promptflow-purple to-promptflow-blue bg-clip-text text-transparent text-9xl font-extrabold">
          404
        </div>
        <h1 className="text-4xl font-bold">Page Not Found</h1>
        <p className="text-xl text-gray-500 max-w-md mx-auto">
          The prompt you're looking for seems to have wandered off into the AI void.
        </p>
        <Link to="/">
          <Button className="bg-gradient-to-r from-promptflow-purple to-promptflow-blue hover:opacity-90">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
