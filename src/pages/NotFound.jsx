import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-7xl font-bold text-gray-200">404</p>
      <h1 className="text-xl font-bold text-gray-900 mt-4">Not found</h1>
      <p className="text-sm text-gray-500 mt-2 max-w-sm">
        This page doesn't exist.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
      >
        <Home className="w-4 h-4" />
        Back to Dashboard
      </Link>
    </div>
  );
}
