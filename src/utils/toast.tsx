import { toast } from "sonner";

export const showCustomToastError = (error: any, message = "") => {
  toast.custom((id) => (
    <div
      onClick={() => toast.dismiss(id)}
      className="bg-red-600 text-white w-full max-w-xl rounded-md shadow-md flex items-center justify-between px-6"
    >
      <div className="py-3">
        <p className="font-medium text-base">Error</p>
        <p className="text-sm">
          {(error.message || message) ?? "Something went wrong!"}
        </p>
      </div>
      <button className="ml-4 text-white hover:text-gray-200">✖</button>
    </div>
  ));
};
