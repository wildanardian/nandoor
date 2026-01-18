import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { Fragment, ReactNode } from 'react';
import { X } from 'lucide-react';

interface TandurModalProps {
  show: boolean;
  onClose: () => void;
  title: string;
  footer?: ReactNode;
  children: ReactNode;
}

export default function TandurModal({ show, onClose, title, footer, children }: TandurModalProps) {
  return (
    <Transition show={show} as={Fragment}>
      <Dialog as="div" className="relative z-[60]" onClose={onClose}>
        {/* Backdrop */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-dark-tandur/50 backdrop-blur-sm transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto sm:overflow-hidden">
          <div className="flex min-h-full items-end justify-center sm:items-center sm:p-4 text-center sm:text-left">
            <TransitionChild
              as={Fragment}
              enter="transform transition ease-out duration-300"
              enterFrom="translate-y-full sm:translate-y-4 sm:opacity-0 sm:scale-95"
              enterTo="translate-y-0 sm:translate-y-0 sm:opacity-100 sm:scale-100"
              leave="transform transition ease-in duration-200"
              leaveFrom="translate-y-0 sm:translate-y-0 sm:opacity-100 sm:scale-100"
              leaveTo="translate-y-full sm:translate-y-4 sm:opacity-0 sm:scale-95"
            >
              <DialogPanel className="relative w-full h-[100dvh] sm:h-auto sm:max-w-xl transform flex flex-col bg-white-tandur text-left shadow-xl transition-all sm:rounded-2xl rounded-t-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 sticky top-0 bg-white-tandur z-10 sm:rounded-t-2xl rounded-t-2xl">
                  <h3 className="text-xl font-bold text-dark-tandur leading-6">{title}</h3>
                  <button
                    onClick={onClose}
                    className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none"
                  >
                    <X className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-6 sm:max-h-[70vh]">
                  {children}
                </div>

                {/* Footer */}
                {footer && (
                  <div className="sticky bottom-0 border-t border-gray-100 bg-gray-50 px-6 py-4 sm:rounded-b-2xl rounded-none z-10">
                    <div className="flex flex-row gap-3 sm:justify-end">
                      {/* Expectation: Buttons passed in footer should already handle width/layout, 
                           but commonly we want them to fill width or align right.
                           User Request: "Button selalu horizontal. Secondary di kiri, Primary di kanan."
                           We enforce flex container here.
                       */}
                      {footer}
                    </div>
                  </div>
                )}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
