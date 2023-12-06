import { HTMLProps, useEffect, useRef } from "react";

interface Props {
  indeterminate?: boolean;
}

export const IndeterminateCheckbox = ({
  indeterminate,
  className = "",
  ...rest
}: Props & HTMLProps<HTMLInputElement>) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const ref = useRef<HTMLInputElement>(null!);

  useEffect(() => {
    if (typeof indeterminate === "boolean") {
      ref.current.indeterminate = !rest.checked && indeterminate;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, indeterminate]);

  return <input type="checkbox" ref={ref} className={className + " cursor-pointer"} {...rest} />;
};
