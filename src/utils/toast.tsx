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

export const showCustomToastSuccess = (message = "Success") => {
  toast.custom((id) => (
    <div
      onClick={() => toast.dismiss(id)}
      className="bg-green-600 text-white w-full max-w-xl rounded-md shadow-md flex items-center justify-between px-6"
    >
      <div className="py-3">
        <p className="font-medium text-base">Success</p>
        <p className="text-sm">{message}</p>
      </div>
      <button className="ml-4 text-white hover:text-gray-200">✖</button>
    </div>
  ));
};

export const showCustomToastNotification = (title: string, body: string) => {
  toast.custom((id) => (
    <div
      onClick={() => toast.dismiss(id)}
      className="bg-green-600 text-white w-full max-w-xl rounded-md shadow-md flex items-center justify-between px-6 cursor-pointer"
    >
      <div className="flex items-start gap-3 py-3">
        <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full flex-shrink-0">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </div>
        <div>
          <p className="font-medium text-base">{title}</p>
          <p className="text-sm">{body}</p>
        </div>
      </div>
      <button className="ml-4 text-white hover:text-gray-200">✖</button>
    </div>
  ));
};
