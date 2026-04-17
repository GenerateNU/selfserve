import type { SVGProps } from "react";

export function NotebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 13 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M3.5 0.5V3.45385M6.5 0.5V3.45385M9.5 0.5V3.45385M3.5 6.40769H8M3.5 9.36154H9.5M3.5 12.3154H7.25M2 1.97692H11C11.8284 1.97692 12.5 2.63816 12.5 3.45385V13.7923C12.5 14.608 11.8284 15.2692 11 15.2692H2C1.17157 15.2692 0.5 14.608 0.5 13.7923V3.45385C0.5 2.63816 1.17157 1.97692 2 1.97692Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
