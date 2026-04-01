export function EmptyResumeIllustration({ className = "max-w-[220px]" }) {
  return (
    <svg
      className={`mx-auto w-full text-blue-600 ${className}`}
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect
        x="24"
        y="20"
        width="152"
        height="112"
        rx="12"
        className="fill-blue-50 stroke-blue-200"
        strokeWidth="2"
      />
      <path
        d="M48 52h104M48 72h72M48 92h88"
        className="stroke-blue-200"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="148" cy="112" r="28" className="fill-blue-600" />
      <path
        d="M138 112l6 6 14-14"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EmptyCoverLettersIllustration({ className = "max-w-[220px]" }) {
  return (
    <svg
      className={`mx-auto w-full text-violet-600 ${className}`}
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M56 28h88l24 24v80a8 8 0 01-8 8H56a8 8 0 01-8-8V36a8 8 0 018-8z"
        className="fill-violet-50 stroke-violet-200"
        strokeWidth="2"
      />
      <path
        d="M140 28v24h24"
        className="stroke-violet-200"
        strokeWidth="2"
      />
      <path
        d="M72 80h56M72 100h40"
        className="stroke-violet-200"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M152 120c8-8 20-8 28 0"
        className="stroke-violet-400"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
