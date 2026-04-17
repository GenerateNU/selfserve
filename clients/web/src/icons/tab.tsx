import type { SVGProps } from "react";

export function TabIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M5.5 2.5C5.5 1.11929 6.61929 0 8 0C9.38071 0 10.5 1.11929 10.5 2.5C10.5 3.88071 9.38071 5 8 5C6.61929 5 5.5 3.88071 5.5 2.5Z"
        fill="currentColor"
      />
      <path
        d="M5.5 13.5C5.5 12.1193 6.61929 11 8 11C9.38071 11 10.5 12.1193 10.5 13.5C10.5 14.8807 9.38071 16 8 16C6.61929 16 5.5 14.8807 5.5 13.5Z"
        fill="currentColor"
      />
      <path
        d="M0 8C0 6.61929 1.11929 5.5 2.5 5.5C3.88071 5.5 5 6.61929 5 8C5 9.38071 3.88071 10.5 2.5 10.5C1.11929 10.5 0 9.38071 0 8Z"
        fill="currentColor"
      />
      <path
        d="M11 8C11 6.61929 12.1193 5.5 13.5 5.5C14.8807 5.5 16 6.61929 16 8C16 9.38071 14.8807 10.5 13.5 10.5C12.1193 10.5 11 9.38071 11 8Z"
        fill="currentColor"
      />
    </svg>
  );
}
