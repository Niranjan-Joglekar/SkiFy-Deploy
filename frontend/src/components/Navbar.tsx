"use client"

import * as React from "react"
import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import Image from "next/image"

const navbarItems: { title: string; href: string; description: string }[] = [
  {
    title: "Home",
    href: "/",
    description:
      "",
  },
  {
    title: "Courses",
    href: "/courses",
    description:
      "",
  },
  {
    title: "About Us",
    href: "/about-us",
    description:
      "",
  },
  {
    title: "Pricing",
    href: "/pricing",
    description:
      "",
  },
  {
    title: "Contact",
    href: "/contact",
    description:
      "",
  },
]

const authNavbarItems: { title: string; href: string; description: string, className: string, linkClassName: string }[] = [
  {
    title: "Sign Up",
    href: "/sign-up",
    description:
      "",
    className: "",
    linkClassName: ""
  },
  {
    title: "Login",
    href: "/login",
    description:
      "",
    className: "bg-blue-500 text-white rounded-md hover:bg-blue-800",
    linkClassName: "hover:bg-blue-800 hover:text-accent-white px-5",
  },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative flex justify-between items-center w-full my-3">
      {/* Logo */}
      <div className="flex items-center ml-5">
        <Image src={"next.svg"} alt={"Ski-Fy Logo"} width="50" height="50" />
      </div>

      {/* Desktop Navigation */}
      <NavigationMenu className="hidden md:flex">
        <NavigationMenuList className="mx-3">
          {navbarItems.map((listItem, index) => (
            <NavigationMenuItem key={index}>
              <NavigationMenuLink asChild>
                <Link href={listItem.href}>{listItem.title}</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>

      {/* Desktop Auth */}
      <NavigationMenu className="hidden md:flex mr-5">
        <NavigationMenuList className="">
          {authNavbarItems.map((listItem, index) => (
            <NavigationMenuItem key={index} className={listItem.className}>
              <NavigationMenuLink asChild className={listItem.linkClassName}>
                <Link href={listItem.href}>{listItem.title}</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden mr-5 p-2 pr-0 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-lg md:hidden z-50 overflow-hidden">
          <div className="flex flex-col p-4 space-y-2">
            {navbarItems.map((listItem, index) => (
              <Link
                key={index}
                href={listItem.href}
                className="py-2 px-4 hover:bg-gray-100 rounded transform transition-all duration-300 ease-out"
                style={{
                  animation: `slideInRight 0.3s ease-out ${index * 0.1}s both`
                }}
                onClick={() => setIsOpen(false)}
              >
                {listItem.title}
              </Link>
            ))}
            <div className="border-t pt-2 mt-2 space-y-2">
              {authNavbarItems.map((listItem, index) => (
                <Link
                  key={index}
                  href={listItem.href}
                  className={`block py-2 px-4 rounded transform transition-all duration-300 ease-out ${listItem.className || "hover:bg-gray-100"
                    }`}
                  style={{
                    animation: `slideInRight 0.3s ease-out ${(navbarItems.length + index) * 0.1}s both`
                  }}
                  onClick={() => setIsOpen(false)}
                >
                  {listItem.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}