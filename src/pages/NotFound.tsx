import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="min-h-screen paper-bg flex items-center justify-center px-6">
      <div className="text-center page-enter">
        <p className="eyebrow mb-6">Error 404</p>
        <h1 className="serif text-7xl md:text-[10rem] text-ink leading-[0.85]">
          Lost<span className="text-terracotta italic"> Page.</span>
        </h1>
        <p className="mt-8 text-ink-soft max-w-md mx-auto leading-relaxed italic">
          This page doesn't exist — but your study path does. Let's get you back on track.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link to="/" className="oval-btn oval-btn-solid">
            Back Home
          </Link>
          <Link to="/auth" className="oval-btn">
            Sign In
          </Link>
          <Link to="/predictor" className="oval-btn">
            Try Predictor
          </Link>
        </div>
      </div>
    </main>
  );
}
