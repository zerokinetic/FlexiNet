import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Filter,
  Download,
  CreditCard,
  UserPlus,
  Settings,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from "lucide-react"

const activityData = [
  {
    id: 1,
    type: "payment",
    action: "Payment Successful",
    service: "Netflix Premium",
    amount: "$15.99",
    timestamp: "2024-01-15 10:30 AM",
    status: "success",
    icon: CheckCircle,
    details: "Monthly subscription payment processed successfully",
  },
  {
    id: 2,
    type: "subscription",
    action: "Plan Upgraded",
    service: "Spotify",
    amount: "+$5.00",
    timestamp: "2024-01-14 3:45 PM",
    status: "info",
    icon: ArrowUpRight,
    details: "Upgraded from Individual to Family plan",
  },
  {
    id: 3,
    type: "payment",
    action: "Payment Failed",
    service: "Adobe Creative Cloud",
    amount: "$52.99",
    timestamp: "2024-01-12 9:15 AM",
    status: "error",
    icon: XCircle,
    details: "Payment declined - insufficient funds",
  },
  {
    id: 4,
    type: "subscription",
    action: "Auto-renewal Disabled",
    service: "GitHub Pro",
    amount: "$4.00",
    timestamp: "2024-01-10 2:20 PM",
    status: "warning",
    icon: Settings,
    details: "Auto-renewal turned off for next billing cycle",
  },
  {
    id: 5,
    type: "subscription",
    action: "New Subscription",
    service: "Dropbox Plus",
    amount: "$9.99",
    timestamp: "2024-01-08 11:00 AM",
    status: "success",
    icon: UserPlus,
    details: "Successfully subscribed to Dropbox Plus plan",
  },
  {
    id: 6,
    type: "payment",
    action: "Payment Retry",
    service: "Adobe Creative Cloud",
    amount: "$52.99",
    timestamp: "2024-01-07 8:30 AM",
    status: "info",
    icon: RefreshCw,
    details: "Automatic payment retry scheduled",
  },
  {
    id: 7,
    type: "subscription",
    action: "Plan Downgraded",
    service: "Netflix",
    amount: "-$5.00",
    timestamp: "2024-01-05 4:15 PM",
    status: "info",
    icon: ArrowDownRight,
    details: "Downgraded from Premium to Standard plan",
  },
  {
    id: 8,
    type: "payment",
    action: "Payment Method Updated",
    service: "All Services",
    amount: "",
    timestamp: "2024-01-03 1:45 PM",
    status: "info",
    icon: CreditCard,
    details: "Default payment method changed to Visa ****4242",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "success":
      return "text-green-600 bg-green-50 border-green-200"
    case "error":
      return "text-red-600 bg-red-50 border-red-200"
    case "warning":
      return "text-yellow-600 bg-yellow-50 border-yellow-200"
    case "info":
      return "text-blue-600 bg-blue-50 border-blue-200"
    default:
      return "text-gray-600 bg-gray-50 border-gray-200"
  }
}

const getBadgeVariant = (status: string) => {
  switch (status) {
    case "success":
      return "default"
    case "error":
      return "destructive"
    case "warning":
      return "secondary"
    case "info":
      return "outline"
    default:
      return "secondary"
  }
}

export default function ActivityPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Activity Log</h1>
          <p className="text-muted-foreground mt-2">Track all subscription activities and payment events</p>
        </div>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Download className="h-4 w-4" />
          Export Log
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search activities..." className="pl-10" />
              </div>
            </div>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Activity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="payment">Payments</SelectItem>
                <SelectItem value="subscription">Subscriptions</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Chronological list of all subscription and payment activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activityData.map((activity) => {
              const Icon = activity.icon
              return (
                <div
                  key={activity.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border ${getStatusColor(activity.status)}`}
                >
                  <div className={`p-2 rounded-full ${getStatusColor(activity.status)}`}>
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{activity.action}</h4>
                        <Badge variant={getBadgeVariant(activity.status)}>{activity.type}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {activity.amount && <span className="font-medium">{activity.amount}</span>}
                        <span>{activity.timestamp}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{activity.service}</p>
                        <p className="text-sm text-muted-foreground">{activity.details}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityData.length}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Payments</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activityData.filter((a) => a.type === "payment" && a.status === "success").length}
            </div>
            <p className="text-xs text-muted-foreground">Payment success rate: 67%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {activityData.filter((a) => a.type === "payment" && a.status === "error").length}
            </div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plan Changes</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {activityData.filter((a) => a.action.includes("Plan") || a.action.includes("Subscription")).length}
            </div>
            <p className="text-xs text-muted-foreground">Upgrades and downgrades</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
