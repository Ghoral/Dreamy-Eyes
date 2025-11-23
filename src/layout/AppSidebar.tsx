import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";

// Assume these icons are imported from an icon library
import {
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  TableIcon,
  ListIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { appStore } from "../store";
// import SidebarWidget from "./SidebarWidget";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    subItems: [{ name: "Ecommerce", path: "/", pro: false }],
  },
  {
    name: "Forms",
    icon: <ListIcon />,
    subItems: [
      { name: "Landing", path: "/form/landing", pro: false },
      { name: "Product", path: "/form/product", pro: false },
      { name: "Sales", path: "/form/sales", pro: false },
      { name: "Colors", path: "/form/colors", pro: false },
      { name: "Offers", path: "/form/offers", pro: false },
    ],
  },
  {
    name: "Tables",
    icon: <TableIcon />,
    subItems: [
      { name: "Admins", path: "/admins", pro: false },
      { name: "Users", path: "/users", pro: false },
      { name: "Invite Admin", path: "/invite-admin", pro: false },
      { name: "Products", path: "/products", pro: false },
      { name: "Sales", path: "/sales", pro: false },
      { name: "Orders", path: "/orders", pro: false },
      { name: "Delivery Orders", path: "/delivery-orders", pro: false },
      { name: "Activity Logs", path: "/activity-logs", pro: false },
      { name: "Report Generation", path: "/report-generation", pro: false },
    ],
  },
  {
    name: "Social Media",
    icon: <ListIcon />,
    subItems: [{ name: "TikTok", path: "/social/tiktok", pro: false }],
  },
];

const othersItems: NavItem[] = [];

const AppSidebar: React.FC = () => {
  const { userData } = appStore();
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleMobileSidebar } = useSidebar();
  const location = useLocation();

  const role = userData?.role || "user";

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => {
    // For delivery role, only show Delivery Orders
    if (role === "delivery") {
      return (
        <ul className="flex flex-col gap-4">
          <li>
            <Link
              to="/delivery-orders"
              replace={false}
              onClick={() => {
                // Close mobile menu when clicking a menu item
                if (isMobileOpen) {
                  toggleMobileSidebar();
                }
              }}
              className={`menu-item group cursor-pointer ${
                isActive("/delivery-orders")
                  ? "menu-item-active"
                  : "menu-item-inactive"
              }`}
              style={{ display: 'block', width: '100%' }}
            >
              <span
                className={`menu-item-icon-size ${
                  isActive("/delivery-orders")
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                <TableIcon />
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">Delivery Orders</span>
              )}
            </Link>
          </li>
        </ul>
      );
    }

    return (
      <ul className="flex flex-col gap-4">
        {items.map((nav, index) => {
          return (
            <li key={nav.name}>
              {nav.subItems ? (
                <button
                  onClick={() => handleSubmenuToggle(index, menuType)}
                  className={`menu-item group ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? "menu-item-active"
                      : "menu-item-inactive"
                  } cursor-pointer ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "lg:justify-start"
                  }`}
                >
                  <span
                    className={`menu-item-icon-size  ${
                      openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <ChevronDownIcon
                      className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                        openSubmenu?.type === menuType &&
                        openSubmenu?.index === index
                          ? "rotate-180 text-brand-500"
                          : ""
                      }`}
                    />
                  )}
                </button>
              ) : (
                nav.path && (
                  <Link
                    to={nav.path}
                    onClick={() => {
                      // Close mobile menu when clicking a menu item
                      if (isMobileOpen) {
                        toggleMobileSidebar();
                      }
                    }}
                    className={`menu-item group ${
                      isActive(nav.path)
                        ? "menu-item-active"
                        : "menu-item-inactive"
                    }`}
                  >
                    <span
                      className={`menu-item-icon-size ${
                        isActive(nav.path)
                          ? "menu-item-icon-active"
                          : "menu-item-icon-inactive"
                      }`}
                    >
                      {nav.icon}
                    </span>
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <span className="menu-item-text">{nav.name}</span>
                    )}
                  </Link>
                )
              )}
              {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
                <div
                  ref={(el) => {
                    subMenuRefs.current[`${menuType}-${index}`] = el;
                  }}
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    height:
                      openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                        ? `${subMenuHeight[`${menuType}-${index}`]}px`
                        : "0px",
                  }}
                >
                  <ul className="mt-2 space-y-1 ml-9">
                    {nav.subItems
                      .filter((subItem) => {
                        if (subItem.name === "Invite Admin" ||
                          subItem.name === "Activity Logs" ||
                          subItem.name === "Report Generation") {
                          return role === "super_admin";
                        }
                        if (subItem.name === "Delivery Orders") {
                          return role === "super_admin" || role === "delivery";
                        }
                        if (subItem.name === "Orders") {
                          return role !== "delivery";
                        }
                        return role !== "delivery";
                      })
                      .map((subItem) => (
                        <li key={subItem.name}>
                          <Link
                            to={subItem.path}
                            onClick={(e) => {
                              e.stopPropagation();
                              // Close mobile menu when clicking a submenu item
                              if (isMobileOpen) {
                                toggleMobileSidebar();
                              }
                            }}
                            className={`menu-dropdown-item cursor-pointer ${
                              isActive(subItem.path)
                                ? "menu-dropdown-item-active"
                                : "menu-dropdown-item-inactive"
                            }`}
                          >
                            {subItem.name}
                            <span className="flex items-center gap-1 ml-auto">
                              {subItem.new && (
                                <span
                                  className={`ml-auto ${
                                    isActive(subItem.path)
                                      ? "menu-dropdown-badge-active"
                                      : "menu-dropdown-badge-inactive"
                                  } menu-dropdown-badge`}
                                >
                                  new
                                </span>
                              )}
                              {subItem.pro && (
                                <span
                                  className={`ml-auto ${
                                    isActive(subItem.path)
                                      ? "menu-dropdown-badge-active"
                                      : "menu-dropdown-badge-inactive"
                                  } menu-dropdown-badge`}
                                >
                                  pro
                                </span>
                              )}
                            </span>
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-3 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[220px]"
            : isHovered
            ? "w-[220px]"
            : "w-[70px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
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
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
          </div>
        </nav>
        {/* SidebarWidget removed */}
      </div>
    </aside>
  );
};

export default AppSidebar;
