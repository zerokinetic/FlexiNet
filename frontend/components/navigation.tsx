"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, CreditCard, Settings, Activity, FileText, Users } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Users", href: "/users", icon: Users },
  { name: "Subscriptions", href: "/subscriptions", icon: FileText },
  { name: "Billing", href: "/billing", icon: CreditCard },
  { name: "Plans", href: "/plans", icon: Settings },
  { name: "Activity", href: "/activity", icon: Activity },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="flex space-x-1 bg-muted p-1 rounded-lg">
      {navigation.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
              pathname === item.href
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}
