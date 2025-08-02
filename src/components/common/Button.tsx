import React from "react";

const Button = ({
  loading,
  onClick,
  children,
}: {
  loading?: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}) => {
  const isDisabled = loading;

  return (
    <button
      disabled={isDisabled}
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-md transition-colors flex items-center justify-center ${
        isDisabled
          ? "bg-gray-400 text-white cursor-not-allowed"
          : "bg-blue-600 text-white hover:bg-blue-700"
      }`}
    >
      {loading && (
        <svg
          className="animate-spin h-5 w-5 mr-2 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
      )}
      {children || "Add Color"}
    </button>
  );
};

export default Button;
