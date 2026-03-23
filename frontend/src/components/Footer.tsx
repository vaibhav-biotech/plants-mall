export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container grid grid-cols-4 gap-8 mb-8">
        <div>
          <h4 className="font-bold mb-4">About</h4>
          <p className="text-sm text-gray-400">Quality plants for your home and garden.</p>
        </div>
        <div>
          <h4 className="font-bold mb-4">Quick Links</h4>
          <ul className="text-sm text-gray-400 space-y-2">
            <li><a href="#">Products</a></li>
            <li><a href="#">Categories</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Support</h4>
          <ul className="text-sm text-gray-400 space-y-2">
            <li><a href="#">FAQ</a></li>
            <li><a href="#">Shipping</a></li>
            <li><a href="#">Returns</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Legal</h4>
          <ul className="text-sm text-gray-400 space-y-2">
            <li><a href="#">Privacy</a></li>
            <li><a href="#">Terms</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
        <p>&copy; 2026 Plants Mall. All rights reserved.</p>
      </div>
    </footer>
  );
}
