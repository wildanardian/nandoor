import { PropsWithChildren } from 'react';

export default function TransactionList({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-col rounded-2xl bg-white-tandur p-2 shadow-sm ring-1 ring-gray-100">
      {children}
    </div>
  );
}
