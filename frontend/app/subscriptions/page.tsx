"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, Search, Calendar, DollarSign, Pause, Play, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Mock subscription data
const subscriptions = [
  {
    id: 1,
    service: "Netflix",
    plan: "Premium",
    planType: "monthly",
    status: "active",
    amount: 15.99,
    renewalDate: "2024-01-15",
    gracePeriodsLeft: 0,
    icon: "/netflix-logo.png",
    category: "Entertainment",
  },
  {
    id: 2,
    service: "Spotify",
    plan: "Individual",
    planType: "monthly",
    status: "active",
    amount: 9.99,
    renewalDate: "2024-01-20",
    gracePeriodsLeft: 0,
    icon: "/spotify-logo.png",
    category: "Music",
  },
  {
    id: 3,
    service: "Adobe Creative Cloud",
    plan: "All Apps",
    planType: "yearly",
    status: "active",
    amount: 52.99,
    renewalDate: "2024-01-25",
    gracePeriodsLeft: 0,
    icon: "/adobe-logo.png",
    category: "Design",
  },
  {
    id: 4,
    service: "GitHub Pro",
    plan: "Pro",
    planType: "monthly",
    status: "paused",
    amount: 4.0,
    renewalDate: "2024-02-01",
    gracePeriodsLeft: 2,
    icon: "/github-logo.png",
    category: "Development",
  },
  {
    id: 5,
    service: "Dropbox Plus",
    plan: "Plus",
    planType: "yearly",
    status: "inactive",
    amount: 119.88,
    renewalDate: "2023-12-15",
    gracePeriodsLeft: 0,
    icon: "/dropbox-logo.png",
    category: "Storage",
  },
  {
    id: 6,
    service: "Microsoft 365",
    plan: "Personal",
    planType: "yearly",
    status: "active",
    amount: 69.99,
    renewalDate: "2024-03-10",
    gracePeriodsLeft: 0,
    icon: "/microsoft-logo.png",
    category: "Productivity",
  },
]

export default function SubscriptionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [planTypeFilter, setPlanTypeFilter] = useState("all")

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter
    const matchesPlanType = planTypeFilter === "all" || sub.planType === planTypeFilter

    return matchesSearch && matchesStatus && matchesPlanType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "paused":
        return "secondary"
      case "inactive":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const handleAction = (action: string, subscriptionId: number) => {
    // Mock action handler - in real app, this would call your API
    console.log(`${action} subscription ${subscriptionId}`)
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
            <p className="text-muted-foreground">Manage all your active and inactive subscriptions</p>
          </div>
          <Button>Add Subscription</Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Active</CardTitle>
              <Play className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subscriptions.filter((s) => s.status === "active").length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paused</CardTitle>
              <Pause className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subscriptions.filter((s) => s.status === "paused").length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive</CardTitle>
              <Trash2 className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subscriptions.filter((s) => s.status === "inactive").length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                $
                {subscriptions
                  .filter((s) => s.status === "active")
                  .reduce((total, s) => {
                    // Convert yearly to monthly for display
                    const monthlyAmount = s.planType === "yearly" ? s.amount / 12 : s.amount
                    return total + monthlyAmount
                  }, 0)
                  .toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search subscriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={planTypeFilter} onValueChange={setPlanTypeFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by plan type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Subscriptions Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Subscriptions</CardTitle>
            <CardDescription>
              Showing {filteredSubscriptions.length} of {subscriptions.length} subscriptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Renewal Date</TableHead>
                  <TableHead>Grace Period</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={subscription.icon || "/placeholder.svg"} alt={subscription.service} />
                          <AvatarFallback>{subscription.service[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{subscription.service}</div>
                          <div className="text-sm text-muted-foreground">{subscription.category}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{subscription.plan}</div>
                        <div className="text-sm text-muted-foreground capitalize">{subscription.planType}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(subscription.status)}>{subscription.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">${subscription.amount}</div>
                      <div className="text-sm text-muted-foreground">
                        per {subscription.planType === "yearly" ? "year" : "month"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{formatDate(subscription.renewalDate)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {subscription.gracePeriodsLeft > 0 ? (
                        <Badge variant="outline">{subscription.gracePeriodsLeft} left</Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleAction("view", subscription.id)}>
                            View Details
                          </DropdownMenuItem>
                          {subscription.status === "active" && (
                            <DropdownMenuItem onClick={() => handleAction("pause", subscription.id)}>
                              Pause Subscription
                            </DropdownMenuItem>
                          )}
                          {subscription.status === "paused" && (
                            <DropdownMenuItem onClick={() => handleAction("resume", subscription.id)}>
                              Resume Subscription
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleAction("edit", subscription.id)}>
                            Edit Plan
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleAction("cancel", subscription.id)}
                            className="text-destructive"
                          >
                            Cancel Subscription
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
