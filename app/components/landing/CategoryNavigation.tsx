"use client";

import { useUserCountry } from "@/app/hooks/useUserCountry";

export default function CategoryNavigation() {
    const { country } = useUserCountry();

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            const offset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth",
            });
        }
    };

    const categories = [
        ...(country === "nepal"
            ? [
                {
                    id: "solutions-section",
                    label: "Solutions",
                    icon: "💧",
                    gradient: "from-blue-500 to-cyan-500",
                },
            ]
            : []),
        {
            id: "eyelashes-section",
            label: "Eye Lashes",
            icon: "👁️",
            gradient: "from-pink-500 to-purple-500",
        },
        {
            id: "applicators-section",
            label: "Applicators",
            icon: "🔧",
            gradient: "from-emerald-500 to-teal-500",
        },
        {
            id: "products-section",
            label: "Sale",
            icon: "🏷️",
            gradient: "from-rose-500 to-orange-500",
        },
    ];

    return (
        <section className="relative py-16 overflow-hidden">
            {/* Minimalist background */}
            <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/30 to-white"></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Minimal header */}
                <div className="text-center mb-12">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                        Explore Collections
                    </h2>
                </div>

                {/* Premium pill-style navigation */}
                <div className="flex flex-wrap justify-center gap-3">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => scrollToSection(category.id)}
                            className={`group relative px-6 py-3 bg-gradient-to-r ${category.gradient} text-white font-semibold rounded-full shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 text-sm`}
                        >
                            <span className="text-lg">{category.icon}</span>
                            <span>{category.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
