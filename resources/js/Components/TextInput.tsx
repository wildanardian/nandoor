import {
  forwardRef,
  InputHTMLAttributes,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';

export default forwardRef(function TextInput(
  {
    type = 'text',
    className = '',
    isFocused = false,
    ...props
  }: InputHTMLAttributes<HTMLInputElement> & { isFocused?: boolean },
  ref,
) {
  const localRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => localRef.current?.focus(),
  }));

  useEffect(() => {
    if (isFocused) {
      localRef.current?.focus();
    }
  }, [isFocused]);

  return (
    <input
      {...props}
      type={type}
      className={
        'rounded-xl border-gray-200 shadow-sm focus:border-main focus:ring-1 focus:ring-main py-3 px-4 ' +
        className
      }
      ref={localRef}
    />
  );
});
