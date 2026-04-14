import logoImg from "@assets/WhatsApp_Image_2025-06-30_at_3.43.38_PM_1776199339550.jpeg";

export function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3 justify-center sm:justify-start">
              <img src={logoImg} alt="Logo" className="h-8 w-8 object-contain rounded-lg flex-shrink-0" style={{ imageRendering: "high-quality" }} />
              <div className="flex flex-col items-center sm:items-start leading-none">
                <span className="font-bold text-sm" style={{ color: "#e4e4e7" }}>ANONYMIKETECH</span>
                <span className="text-[8px] font-semibold tracking-[0.20em] uppercase mt-0.5 whitespace-nowrap text-center sm:text-left" style={{ color: "#00e599", opacity: 0.7 }}>Rock &amp; Roll</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
