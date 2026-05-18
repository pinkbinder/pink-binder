import { Badge } from '@repo/ui'
import { Button } from '@repo/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui'

const stats = [
  { label: 'Total Revenue', value: '$12,450', change: '+12%', positive: true },
  { label: 'Orders', value: '148', change: '+8%', positive: true },
  { label: 'Products', value: '36', change: '+3', positive: true },
  { label: 'Blog Posts', value: '12', change: '-1', positive: false },
]

const recentOrders = [
  {
    id: '#001',
    customer: 'Alice Johnson',
    product: 'Digital Template',
    amount: '$29',
    status: 'Completed',
  },
  {
    id: '#002',
    customer: 'Bob Smith',
    product: 'UI Component Kit',
    amount: '$49',
    status: 'Pending',
  },
  {
    id: '#003',
    customer: 'Carol White',
    product: 'Icon Pack Pro',
    amount: '$19',
    status: 'Completed',
  },
  {
    id: '#004',
    customer: 'David Lee',
    product: 'Brand Strategy Guide',
    amount: '$39',
    status: 'Processing',
  },
]

export default function AdminDashboard() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground">Welcome back, Admin</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={stat.positive ? 'default' : 'destructive'}>{stat.change}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="pb-2 text-left font-medium">Order</th>
                  <th className="pb-2 text-left font-medium">Customer</th>
                  <th className="pb-2 text-left font-medium">Product</th>
                  <th className="pb-2 text-left font-medium">Amount</th>
                  <th className="pb-2 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{order.id}</td>
                    <td className="py-3">{order.customer}</td>
                    <td className="py-3">{order.product}</td>
                    <td className="py-3">{order.amount}</td>
                    <td className="py-3">
                      <Badge
                        variant={
                          order.status === 'Completed'
                            ? 'default'
                            : order.status === 'Pending'
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {order.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
