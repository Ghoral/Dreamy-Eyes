const Button = ({
  disabled,
  onClick,
}: {
  disabled?: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      disabled={disabled}
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-md transition-colors 
          ${
            disabled
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
    >
      Add Color
    </button>
  );
};

export default Button;
