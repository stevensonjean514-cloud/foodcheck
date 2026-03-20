interface FooterProps {
  onNavigate: (page: 'privacy' | 'terms') => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto pb-safe">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
          <div className="text-center sm:text-left">
            <p className="text-sm text-gray-600">
              © 2026 FoodCheck. An independent consumer platform.
            </p>
          </div>

          <div className="flex items-center space-x-6">
            <button
              onClick={() => onNavigate('privacy')}
              className="text-sm text-gray-600 hover:text-red-600 transition-colors font-medium active:scale-95"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onNavigate('terms')}
              className="text-sm text-gray-600 hover:text-red-600 transition-colors font-medium active:scale-95"
            >
              Terms of Service
            </button>
            <a
              href="mailto:foodcheck.ca@gmail.com"
              className="text-sm text-gray-600 hover:text-red-600 transition-colors font-medium active:scale-95"
            >
              Contact
            </a>
          </div>
        </div>

        <div className="mt-4 text-center sm:text-left">
          <p className="text-xs text-gray-500">
            Not affiliated with any restaurant or food brand. All trademarks belong to their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
}
