import {SVGProps} from "react";

export function FilterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M7.11111 2.38889H0.5M9 15.6111H0.5M10.8889 0.5V4.27778M12.7778 13.7222V17.5M17.5 9H9M17.5 15.6111H12.7778M17.5 2.38889H10.8889M5.22222 7.11111V10.8889M5.22222 9H0.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
