export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-slate-950 py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-seridian-400 to-seridian-600">
              <span className="text-xs font-bold text-slate-950">S</span>
            </div>
            <span className="text-sm font-semibold text-white">Seridian</span>
          </div>

          <p className="text-sm text-slate-500">
            Cloud infrastructure & application development consulting.
          </p>

          <p className="text-sm text-slate-600">
            &copy; {currentYear} Seridian. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
