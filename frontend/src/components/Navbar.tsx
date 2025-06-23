"use client"

import * as React from "react"
import Link from "next/link"

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
  return (
    <div className="flex justify-between w-full my-3">
      <NavigationMenu className="">
        <Image src={"next.svg"} alt={"Ski-Fy Logo"} width="50" height="50" className="ml-10"></Image>
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

      <NavigationMenu className="mr-10">
        <NavigationMenuList className="mx-3">
          {authNavbarItems.map((listItem, index) => (
            <NavigationMenuItem key={index} className={listItem.className}>
              <NavigationMenuLink asChild className={listItem.linkClassName}>
                <Link href={listItem.href}>{listItem.title}</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}