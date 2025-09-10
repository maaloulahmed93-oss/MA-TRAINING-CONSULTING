import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  UserGroupIcon,
  AcademicCapIcon,
  CubeIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  UsersIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  BanknotesIcon,
  CogIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  XMarkIcon,
  SparklesIcon,
  WrenchScrewdriverIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";
import { NAVIGATION_ITEMS } from "../../config/routes";
import type { NavigationItem, NavigationChild } from "../../types";

/**
 * Sidebar Component
 * Navigation sidebar with collapsible sections
 */
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Icon mapping
const iconMap = {
  HomeIcon,
  UserGroupIcon,
  AcademicCapIcon,
  CubeIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  UsersIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  BanknotesIcon,
  CogIcon,
  SparklesIcon,
  WrenchScrewdriverIcon,
  ComputerDesktopIcon,
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((item) => item !== itemName)
        : [...prev, itemName]
    );
  };

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  const isParentActive = (item: NavigationItem) => {
    if (item.children) {
      return item.children.some((child: NavigationChild) =>
        isActive(child.href)
      );
    }
    return false;
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0 px-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <span className="ml-3 text-xl font-semibold text-gray-900">
                  MATC Admin
                </span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="mt-8 flex-1 px-2 space-y-1">
              {NAVIGATION_ITEMS.map((item: NavigationItem) => {
                const Icon = iconMap[item.icon as keyof typeof iconMap];
                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = expandedItems.includes(item.name);
                const itemIsActive =
                  isActive(item.href) || isParentActive(item);

                return (
                  <div key={item.name}>
                    {hasChildren ? (
                      <button
                        onClick={() => toggleExpanded(item.name)}
                        className={`${
                          itemIsActive
                            ? "bg-primary-50 border-primary-500 text-primary-700"
                            : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        } group w-full flex items-center pl-2 pr-1 py-2 text-sm font-medium border-l-4 rounded-md`}
                      >
                        <Icon className="mr-3 h-5 w-5" />
                        <span className="flex-1 text-left">{item.name}</span>
                        {isExpanded ? (
                          <ChevronDownIcon className="h-4 w-4" />
                        ) : (
                          <ChevronRightIcon className="h-4 w-4" />
                        )}
                      </button>
                    ) : (
                      <Link
                        to={item.href}
                        className={`${
                          itemIsActive
                            ? "bg-primary-50 border-primary-500 text-primary-700"
                            : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        } group flex items-center pl-2 py-2 text-sm font-medium border-l-4 rounded-md`}
                      >
                        <Icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </Link>
                    )}

                    {/* Submenu */}
                    {hasChildren && isExpanded && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.children?.map((child: NavigationChild) => (
                          <Link
                            key={child.name}
                            to={child.href}
                            className={`${
                              isActive(child.href)
                                ? "bg-primary-50 text-primary-700"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            } group flex items-center pl-4 py-2 text-sm rounded-md`}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:hidden`}
      >
        <div className="flex flex-col h-full">
          {/* Header with close button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="ml-3 text-xl font-semibold text-gray-900">
                MATC Admin
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation - Same as desktop but with click handlers */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {NAVIGATION_ITEMS.map((item: NavigationItem) => {
              const Icon = iconMap[item.icon as keyof typeof iconMap];
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedItems.includes(item.name);
              const itemIsActive = isActive(item.href) || isParentActive(item);

              return (
                <div key={item.name}>
                  {hasChildren ? (
                    <button
                      onClick={() => toggleExpanded(item.name)}
                      className={`${
                        itemIsActive
                          ? "bg-primary-50 border-primary-500 text-primary-700"
                          : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      } group w-full flex items-center pl-2 pr-1 py-2 text-sm font-medium border-l-4 rounded-md`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      <span className="flex-1 text-left">{item.name}</span>
                      {isExpanded ? (
                        <ChevronDownIcon className="h-4 w-4" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4" />
                      )}
                    </button>
                  ) : (
                    <Link
                      to={item.href}
                      onClick={onClose}
                      className={`${
                        itemIsActive
                          ? "bg-primary-50 border-primary-500 text-primary-700"
                          : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      } group flex items-center pl-2 py-2 text-sm font-medium border-l-4 rounded-md`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  )}

                  {/* Submenu */}
                  {hasChildren && isExpanded && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.children?.map((child: NavigationChild) => (
                        <Link
                          key={child.name}
                          to={child.href}
                          onClick={onClose}
                          className={`${
                            isActive(child.href)
                              ? "bg-primary-50 text-primary-700"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          } group flex items-center pl-4 py-2 text-sm rounded-md`}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
