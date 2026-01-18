import { PropsWithChildren } from 'react';
import AuthIllustration from '@/Components/AuthIllustration';

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen w-full bg-white-tandur overflow-hidden flex">
      {/* Left Side - Illustration (Desktop Only) */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <AuthIllustration />
      </div>

      {/* Right Side - Form (Mobile: Full, Desktop: 1/2) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-start lg:justify-center relative">
        {/* Mobile Illustration Header */}
        <div className="lg:hidden h-48 w-full bg-main relative overflow-hidden flex items-center justify-center rounded-b-[3rem]">
          <div className="flex items-center gap-2 z-10">
            <img src="/images/logo/logo-white-tandur.svg" alt="Logo" className="h-12 w-12" />
            <span className="text-4xl font-bold text-white-tandur tracking-tight">Tandur</span>
          </div>
          {/* <div className="text-main text-center z-10 mt-4">
            <div className="relative flex h-48 w-48 items-center justify-center p-8">
              <img
                src="/images/illustration/art-petani.png"
                alt="Logo"
                className="h-full w-full scale-150 z-10 relative"
              />
            </div>
          </div> */}

          {/* Decorative circles */}
          <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-white-tandur/10 blur-xl"></div>
          <div className="absolute top-0 -left-10 h-32 w-32 rounded-full bg-white-tandur/10 blur-xl"></div>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 py-8 lg:px-20 xl:px-32">
          {children}
        </div>
      </div>
    </div>
  );
}
