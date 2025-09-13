import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, CreditCard, AlertCircle, CheckCircle } from "lucide-react"

const billingHistory = [
  {
    id: "INV-001",
    date: "2024-01-15",
    description: "Netflix Premium Plan",
    amount: "$15.99",
    status: "paid",
    method: "Visa •••• 4242",
  },
  {
    id: "INV-002",
    date: "2024-01-10",
    description: "Spotify Premium",
    amount: "$9.99",
    status: "paid",
    method: "Visa •••• 4242",
  },
  {
    id: "INV-003",
    date: "2024-01-05",
    description: "Adobe Creative Cloud",
    amount: "$52.99",
    status: "failed",
    method: "Visa •••• 4242",
  },
  {
    id: "INV-004",
    date: "2023-12-15",
    description: "GitHub Pro",
    amount: "$4.00",
    status: "paid",
    method: "Visa •••• 4242",
  },
  {
    id: "INV-005",
    date: "2023-12-10",
    description: "Dropbox Plus",
    amount: "$9.99",
    status: "paid",
    method: "Visa •••• 4242",
  },
]

const upcomingBills = [
  {
    service: "Netflix Premium",
    amount: "$15.99",
    dueDate: "2024-02-15",
    status: "scheduled",
  },
  {
    service: "Spotify Premium",
    amount: "$9.99",
    dueDate: "2024-02-10",
    status: "scheduled",
  },
  {
    service: "Adobe Creative Cloud",
    amount: "$52.99",
    dueDate: "2024-02-05",
    status: "retry",
  },
]

export default function BillingPage() {
  const totalSpent = billingHistory
    .filter((bill) => bill.status === "paid")
    .reduce((sum, bill) => sum + Number.parseFloat(bill.amount.replace("$", "")), 0)

  const failedPayments = billingHistory.filter((bill) => bill.status === "failed").length

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Billing & Payments</h1>
          <p className="text-muted-foreground mt-2">Manage your payment history and upcoming bills</p>
        </div>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Download className="h-4 w-4" />
          Export History
        </Button>
      </div>

      {/* Billing Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{failedPayments}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Bill</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Feb 5</div>
            <p className="text-xs text-muted-foreground">Adobe Creative Cloud</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Bills */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Bills</CardTitle>
          <CardDescription>Your scheduled payments for the next billing cycle</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingBills.map((bill, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{bill.service}</p>
                    <p className="text-sm text-muted-foreground">Due {bill.dueDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={bill.status === "retry" ? "destructive" : "secondary"}>
                    {bill.status === "retry" ? "Payment Failed" : "Scheduled"}
                  </Badge>
                  <span className="font-semibold">{bill.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Complete history of your subscription payments</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billingHistory.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.id}</TableCell>
                  <TableCell>{payment.date}</TableCell>
                  <TableCell>{payment.description}</TableCell>
                  <TableCell className="text-muted-foreground">{payment.method}</TableCell>
                  <TableCell>
                    <Badge variant={payment.status === "paid" ? "default" : "destructive"}>
                      {payment.status === "paid" ? "Paid" : "Failed"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{payment.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
