export default function ProductCardShimmer() {
    return (
        <div className="bg-white rounded-3xl shadow-md border border-secondary-100 overflow-hidden animate-pulse">
            {/* Image placeholder */}
            <div className="aspect-square bg-gray-200"></div>

            {/* Content placeholder */}
            <div className="p-6 space-y-3">
                {/* Title */}
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>

                {/* Description */}
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>

                {/* Price */}
                <div className="h-8 bg-gray-200 rounded w-1/2 mt-4"></div>

                {/* Button */}
                <div className="h-10 bg-gray-200 rounded w-full mt-4"></div>
            </div>
        </div>
    );
}
