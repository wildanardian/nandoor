import { ImgHTMLAttributes } from 'react';

export default function AuthIllustration({
  className = '',
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <div className={`relative flex h-full w-full flex-col items-center justify-center bg-main p-10 text-white-tandur ${className}`}>
      <div className="absolute left-6 top-6 flex items-center gap-2">
        <img src="/images/logo/logo-fix.svg" alt="Logo" className="h-10 w-10" />
        <span className="text-2xl font-bold tracking-tight">Tandur</span>
      </div>

      <div className="flex flex-col items-center justify-center space-y-6 text-center">
        {/* SVG Illustration Placeholder */}
        <div className="relative flex h-72 w-72 items-center justify-center p-8">
          <img
            src="/images/illustration/art-petani.png"
            alt="Logo"
            className="h-full w-full scale-150 z-10 relative"
          />
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Teman Digital Petani Masa Kini</h2>
          <p className="text-md text-white-tandur/80 max-w-xl">
            Catat aktivitas, pantau hasil, dan kembangkan usaha tani Anda dalam satu platform.
          </p>
        </div>
      </div>
    </div>
  );
}
