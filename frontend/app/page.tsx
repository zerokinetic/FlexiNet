import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarDays, CreditCard, DollarSign, Settings, TrendingUp } from "lucide-react"

// Mock data - in a real app, this would come from your API/database
const userData = {
  name: "John Doe",
  email: "john.doe@example.com",
  status: "Premium",
  avatar: "/professional-headshot.png",
  totalMonthlySpend: 89.97,
  activeSubscriptions: 4,
  inactiveSubscriptions: 2,
}

const recentSubscriptions = [
  {
    id: 1,
    service: "Netflix",
    plan: "Premium",
    status: "active",
    amount: 15.99,
    renewalDate: "2024-01-15",
    icon: "/netflix-logo.png",
  },
  {
    id: 2,
    service: "Spotify",
    plan: "Individual",
    status: "active",
    amount: 9.99,
    renewalDate: "2024-01-20",
    icon: "/spotify-logo.png",
  },
  {
    id: 3,
    service: "Adobe Creative Cloud",
    plan: "All Apps",
    status: "active",
    amount: 52.99,
    renewalDate: "2024-01-25",
    icon: "/adobe-logo.png",
  },
  {
    id: 4,
    service: "GitHub Pro",
    plan: "Pro",
    status: "paused",
    amount: 4.0,
    renewalDate: "2024-02-01",
    icon: "/github-logo.png",
  },
]

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Manage your subscriptions and billing</p>
          </div>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>

        {/* User Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={userData.avatar || "/placeholder.svg"} alt={userData.name} />
                <AvatarFallback>
                  {userData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">{userData.name}</h3>
                <p className="text-sm text-muted-foreground">{userData.email}</p>
                <Badge variant="secondary">{userData.status}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Spend</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${userData.totalMonthlySpend}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="mr-1 inline h-3 w-3" />
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userData.activeSubscriptions}</div>
              <p className="text-xs text-muted-foreground">{userData.inactiveSubscriptions} inactive</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Renewal</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Jan 15</div>
              <p className="text-xs text-muted-foreground">Netflix Premium - $15.99</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Subscriptions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Subscriptions</CardTitle>
            <CardDescription>Your most recent subscription activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSubscriptions.map((subscription) => (
                <div key={subscription.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={subscription.icon || "/placeholder.svg"} alt={subscription.service} />
                      <AvatarFallback>{subscription.service[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{subscription.service}</p>
                      <p className="text-xs text-muted-foreground">{subscription.plan}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
                      {subscription.status}
                    </Badge>
                    <div className="text-right">
                      <p className="text-sm font-medium">${subscription.amount}</p>
                      <p className="text-xs text-muted-foreground">Renews {subscription.renewalDate}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Button variant="outline" className="w-full bg-transparent">
                View All Subscriptions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
