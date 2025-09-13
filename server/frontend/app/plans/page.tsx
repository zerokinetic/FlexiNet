import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Check, ArrowUpRight, ArrowDownRight, Settings, Crown, Zap } from "lucide-react"

const subscriptionPlans = [
  {
    id: 1,
    service: "Netflix",
    currentPlan: "Premium",
    price: "$15.99",
    billing: "monthly",
    autoRenewal: true,
    nextBilling: "2024-02-15",
    features: ["4K Ultra HD", "4 screens at once", "Download on 6 devices"],
    availablePlans: [
      { name: "Basic", price: "$6.99", features: ["720p", "1 screen"] },
      { name: "Standard", price: "$10.99", features: ["1080p", "2 screens"] },
      { name: "Premium", price: "$15.99", features: ["4K", "4 screens"], current: true },
    ],
  },
  {
    id: 2,
    service: "Spotify",
    currentPlan: "Premium",
    price: "$9.99",
    billing: "monthly",
    autoRenewal: true,
    nextBilling: "2024-02-10",
    features: ["Ad-free music", "Offline downloads", "High quality audio"],
    availablePlans: [
      { name: "Free", price: "$0.00", features: ["Ads", "Shuffle only"] },
      { name: "Premium", price: "$9.99", features: ["No ads", "Offline", "High quality"], current: true },
      { name: "Family", price: "$15.99", features: ["6 accounts", "No ads", "Offline"] },
    ],
  },
  {
    id: 3,
    service: "Adobe Creative Cloud",
    currentPlan: "All Apps",
    price: "$52.99",
    billing: "monthly",
    autoRenewal: false,
    nextBilling: "2024-02-05",
    features: ["20+ creative apps", "100GB cloud storage", "Premium fonts"],
    availablePlans: [
      { name: "Photography", price: "$20.99", features: ["Photoshop", "Lightroom", "20GB storage"] },
      { name: "Single App", price: "$22.99", features: ["1 app", "100GB storage"] },
      { name: "All Apps", price: "$52.99", features: ["20+ apps", "100GB storage"], current: true },
    ],
  },
]

export default function PlansPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Plan Management</h1>
          <p className="text-muted-foreground mt-2">Manage your subscription plans and billing preferences</p>
        </div>
      </div>

      <div className="space-y-6">
        {subscriptionPlans.map((subscription) => (
          <Card key={subscription.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {subscription.service}
                      <Badge variant="secondary">{subscription.currentPlan}</Badge>
                    </CardTitle>
                    <CardDescription>
                      {subscription.price}/{subscription.billing} • Next billing: {subscription.nextBilling}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Auto-renewal</span>
                    <Switch checked={subscription.autoRenewal} />
                  </div>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Current Plan Features */}
              <div>
                <h4 className="font-medium mb-3">Current Plan Features</h4>
                <div className="grid gap-2">
                  {subscription.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Available Plans */}
              <div>
                <h4 className="font-medium mb-4">Available Plans</h4>
                <div className="grid gap-4 md:grid-cols-3">
                  {subscription.availablePlans.map((plan, index) => (
                    <Card key={index} className={`relative ${plan.current ? "ring-2 ring-primary" : ""}`}>
                      {plan.current && <Badge className="absolute -top-2 left-4 bg-primary">Current Plan</Badge>}
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{plan.name}</CardTitle>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{plan.price}</div>
                            <div className="text-xs text-muted-foreground">per month</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          {plan.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center gap-2 text-sm">
                              <Check className="h-3 w-3 text-green-500" />
                              {feature}
                            </div>
                          ))}
                        </div>

                        {!plan.current && (
                          <Button
                            className="w-full"
                            variant={
                              index > subscription.availablePlans.findIndex((p) => p.current) ? "default" : "outline"
                            }
                          >
                            {index > subscription.availablePlans.findIndex((p) => p.current) ? (
                              <>
                                <ArrowUpRight className="h-4 w-4 mr-2" />
                                Upgrade
                              </>
                            ) : (
                              <>
                                <ArrowDownRight className="h-4 w-4 mr-2" />
                                Downgrade
                              </>
                            )}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Billing Settings */}
              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Billing Cycle</h4>
                  <p className="text-sm text-muted-foreground">Switch between monthly and annual billing</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Monthly</span>
                  <Switch />
                  <span className="text-sm">Annual</span>
                  <Badge variant="secondary" className="ml-2">
                    <Zap className="h-3 w-3 mr-1" />
                    Save 20%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
