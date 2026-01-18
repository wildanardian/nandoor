import { PropsWithChildren } from 'react';

export default function WorkerList({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-col gap-3">
      {children}
    </div>
  );
}
