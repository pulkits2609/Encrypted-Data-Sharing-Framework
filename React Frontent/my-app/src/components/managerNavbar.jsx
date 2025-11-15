"use client"

import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Manager navigation tabs
const managerLinks = [
  { href: "/manager", label: "Dashboard" },
  { href: "/manager/teamFiles", label: "Access Files" },
  { href: "/manager/newTeam", label: "Create New Team" },
  { href: "/manager/createNew", label: "Create New User" },
]

export default function ManagerNavbar() {
  return (
    <header className="border-b px-4 md:px-6 bg-black">
      <div className="flex h-16 items-center justify-between gap-4">
        
        {/* Left section */}
        <div className="flex items-center gap-2">

          {/* Mobile menu */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="group size-8 md:hidden"
                variant="ghost"
                size="icon"
              >
                <svg
                  className="pointer-events-none"
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path
                    d="M4 12L20 12"
                    className="origin-center -translate-y-[7px] transition-all duration-300 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
                  />
                  <path
                    d="M4 12H20"
                    className="transition-all duration-300 group-aria-expanded:rotate-45"
                  />
                  <path
                    d="M4 12H20"
                    className="origin-center translate-y-[7px] transition-all duration-300 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
                  />
                </svg>
              </Button>
            </PopoverTrigger>

            {/* Mobile dropdown menu */}
            <PopoverContent align="start" className="w-36 p-1 md:hidden">
              <NavigationMenu className="max-w-none *:w-full">
                <NavigationMenuList className="flex-col items-start gap-0">
                  {managerLinks.map((link, i) => (
                    <NavigationMenuItem key={i} className="w-full">
                      <NavigationMenuLink
                        href={link.href}
                        className="py-1.5 font-medium"
                      >
                        {link.label}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </PopoverContent>
          </Popover>

          {/* Desktop menu (no logo now) */}
          <div className="flex items-center gap-6">
            <NavigationMenu className="max-md:hidden">
              <NavigationMenuList className="gap-2">
                {managerLinks.map((link, index) => (
                  <NavigationMenuItem key={index}>
                    <NavigationMenuLink
                      href={link.href}
                      className="py-1.5 font-medium hover:text-primary text-muted-foreground"
                    >
                      {link.label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-sm">
            <a href="/">Logout</a>
          </Button>
        </div>

      </div>
    </header>
  )
}
