import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  ChevronDownIcon,
  GridIcon,
  TableIcon,
  ListIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { appStore } from "../store";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    subItems: [{ name: "Ecommerce", path: "/dashboard" }],
  },
  {
    name: "Forms",
    icon: <ListIcon />,
    subItems: [
      { name: "Landing", path: "/form/landing" },
      { name: "Product", path: "/form/product" },
      { name: "Sales", path: "/form/sales" },
      { name: "Colors", path: "/form/colors" },
      { name: "Offers", path: "/form/offers" },
    ],
  },
  {
    name: "Tables",
    icon: <TableIcon />,
    subItems: [
      { name: "Admins", path: "/admins" },
      { name: "Users", path: "/users" },
      { name: "Invite Admin", path: "/invite-admin" },
      { name: "Products", path: "/products" },
      { name: "Sales", path: "/sales" },
      { name: "Orders", path: "/orders" },
      { name: "Delivery Orders", path: "/delivery-orders" },
      { name: "Activity Logs", path: "/activity-logs" },
      { name: "Report Generation", path: "/report-generation" },
    ],
  },
  {
    name: "Social Media",
    icon: <ListIcon />,
    subItems: [{ name: "TikTok", path: "/social/tiktok" }],
  },
];

const AppSidebar: React.FC = () => {
  const { userData } = appStore();
  const { isExpanded, isMobileOpen, toggleMobileSidebar } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const role = userData?.role || "user";

  const [openMenus, setOpenMenus] = useState<Set<string>>(new Set());

  const isActive = (path: string) => location.pathname === path;

  // Auto-open menu if current path matches
  useEffect(() => {
    const newOpenMenus = new Set<string>();
    navItems.forEach((nav, index) => {
      if (nav.subItems) {
        const hasActive = nav.subItems.some((item) => isActive(item.path));
        if (hasActive) {
          newOpenMenus.add(`menu-${index}`);
        }
      }
    });
    setOpenMenus(newOpenMenus);
  }, [location.pathname]);

  const toggleMenu = (menuKey: string) => {
    setOpenMenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(menuKey)) {
        newSet.delete(menuKey);
      } else {
        newSet.add(menuKey);
      }
      return newSet;
    });
  };

  const filterSubItems = (subItems: { name: string; path: string }[]) => {
    return subItems.filter((subItem) => {
      if (subItem.name === "Invite Admin" || subItem.name === "Activity Logs" || subItem.name === "Report Generation") {
        return role === "super_admin";
      }
      if (subItem.name === "Delivery Orders") {
        return role === "super_admin" || role === "delivery";
      }
      if (subItem.name === "Orders") {
        return role !== "delivery";
      }
      return role !== "delivery";
    });
  };

  // For delivery role, only show Delivery Orders
  if (role === "delivery") {
    return (
      <aside
        className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-3 left-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen z-50 w-[220px] ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } transition-transform duration-300`}
      >
        <div className="py-8">
          <button
            onClick={() => {
              navigate("/dashboard");
              if (isMobileOpen) toggleMobileSidebar();
            }}
            className="cursor-pointer"
          >
            <img
              className="dark:hidden"
              src="/images/logo/logo.svg"
              alt="Logo"
              width={120}
              height={32}
            />
            <img
              className="hidden dark:block"
              src="/images/logo/logo-dark.svg"
              alt="Logo"
              width={120}
              height={32}
            />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => {
                  navigate("/delivery-orders");
                  if (isMobileOpen) toggleMobileSidebar();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive("/delivery-orders")
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                <TableIcon className="w-5 h-5" />
                <span className="font-medium">Delivery Orders</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    );
  }

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-3 left-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen z-50 ${
        isExpanded ? "w-[220px]" : "w-[70px]"
      } ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      } transition-all duration-300`}
    >
      <div className="py-8 flex justify-center lg:justify-start">
        <button
          onClick={() => {
            navigate("/dashboard");
            if (isMobileOpen) toggleMobileSidebar();
          }}
          className="cursor-pointer"
        >
          {isExpanded ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={120}
                height={32}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={120}
                height={32}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((nav, index) => {
            const menuKey = `menu-${index}`;
            const isOpen = openMenus.has(menuKey);
            const filteredSubItems = nav.subItems ? filterSubItems(nav.subItems) : [];

            if (nav.subItems && filteredSubItems.length > 0) {
              return (
                <li key={nav.name}>
                  <button
                    onClick={() => toggleMenu(menuKey)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isOpen
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span className="w-5 h-5">{nav.icon}</span>
                    {isExpanded && <span className="font-medium flex-1 text-left">{nav.name}</span>}
                    {isExpanded && (
                      <ChevronDownIcon
                        className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    )}
                  </button>
                  {isExpanded && isOpen && (
                    <ul className="ml-4 mt-1 space-y-1">
                      {filteredSubItems.map((subItem) => (
                        <li key={subItem.path}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log("Navigating to:", subItem.path);
                              navigate(subItem.path, { replace: false });
                              if (isMobileOpen) toggleMobileSidebar();
                            }}
                            className={`w-full text-left block px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                              isActive(subItem.path)
                                ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-medium"
                                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                            }`}
                          >
                            {subItem.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            }

            if (nav.path) {
              return (
                <li key={nav.name}>
                  <button
                    onClick={() => {
                      navigate(nav.path!);
                      if (isMobileOpen) toggleMobileSidebar();
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive(nav.path)
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span className="w-5 h-5">{nav.icon}</span>
                    {isExpanded && <span className="font-medium">{nav.name}</span>}
                  </button>
                </li>
              );
            }

            return null;
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default AppSidebar;
