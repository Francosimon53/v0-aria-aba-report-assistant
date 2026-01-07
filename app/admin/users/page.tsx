"use client"

import { Suspense, useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Calendar,
  CreditCard,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  created_at: string
  subscription_status: string | null
  trial_started_at: string | null
  trial_ends_at: string | null
  trial_used: boolean
  stripe_customer_id: string | null
  npi: string | null
  assessmentCount?: number
  reportCount?: number
}

function UsersPageContent() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const usersPerPage = 20
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [currentPage])

  useEffect(() => {
    filterUsers()
  }, [users, searchQuery, statusFilter])

  const fetchUsers = async () => {
    setIsLoading(true)
    const supabase = createClient()

    const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true })
    setTotalUsers(count || 0)

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .range((currentPage - 1) * usersPerPage, currentPage * usersPerPage - 1)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    const usersWithCounts = await Promise.all(
      (profiles || []).map(async (profile) => {
        const { count: assessmentCount } = await supabase
          .from("assessments")
          .select("*", { count: "exact", head: true })
          .eq("user_id", profile.id)

        const { count: reportCount } = await supabase
          .from("report_sections")
          .select("*", { count: "exact", head: true })
          .eq("assessment_id", profile.id)

        return {
          ...profile,
          assessmentCount: assessmentCount || 0,
          reportCount: reportCount || 0,
        }
      }),
    )

    setUsers(usersWithCounts)
    setIsLoading(false)
  }

  const filterUsers = () => {
    let filtered = [...users]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (user) =>
          user.email?.toLowerCase().includes(query) ||
          user.full_name?.toLowerCase().includes(query) ||
          user.npi?.includes(query),
      )
    }

    if (statusFilter !== "all") {
      if (statusFilter === "trial") {
        filtered = filtered.filter(
          (user) => user.trial_ends_at && new Date(user.trial_ends_at) > new Date() && !user.subscription_status,
        )
      } else if (statusFilter === "expired") {
        filtered = filtered.filter(
          (user) => user.trial_ends_at && new Date(user.trial_ends_at) <= new Date() && !user.subscription_status,
        )
      } else {
        filtered = filtered.filter((user) => user.subscription_status === statusFilter)
      }
    }

    setFilteredUsers(filtered)
  }

  const getStatusBadge = (user: UserProfile) => {
    if (user.subscription_status === "active") {
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>
    }
    if (user.trial_ends_at && new Date(user.trial_ends_at) > new Date()) {
      const daysLeft = Math.ceil((new Date(user.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Trial ({daysLeft}d)</Badge>
    }
    if (user.trial_used || (user.trial_ends_at && new Date(user.trial_ends_at) <= new Date())) {
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Expired</Badge>
    }
    return <Badge variant="secondary">Free</Badge>
  }

  const extendTrial = async (userId: string, days: number) => {
    const supabase = createClient()
    const newEndDate = new Date()
    newEndDate.setDate(newEndDate.getDate() + days)

    const { error } = await supabase
      .from("profiles")
      .update({
        trial_ends_at: newEndDate.toISOString(),
        trial_used: false,
      })
      .eq("id", userId)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to extend trial",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: `Trial extended by ${days} days`,
      })
      fetchUsers()
    }
  }

  const totalPages = Math.ceil(totalUsers / usersPerPage)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-muted-foreground">Manage registered users and subscriptions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold">{totalUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active Subscriptions</p>
            <p className="text-2xl font-bold">{users.filter((u) => u.subscription_status === "active").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">In Trial</p>
            <p className="text-2xl font-bold">
              {
                users.filter((u) => u.trial_ends_at && new Date(u.trial_ends_at) > new Date() && !u.subscription_status)
                  .length
              }
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Expired Trials</p>
            <p className="text-2xl font-bold">
              {
                users.filter(
                  (u) => u.trial_ends_at && new Date(u.trial_ends_at) <= new Date() && !u.subscription_status,
                ).length
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email, name, or NPI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trial">In Trial</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-4 p-4 border rounded-lg">
                  <div className="h-10 w-10 bg-slate-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No users found</p>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">User</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Joined</th>
                      <th className="text-left p-3 font-medium">Assessments</th>
                      <th className="text-left p-3 font-medium">Reports</th>
                      <th className="text-right p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-slate-50">
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{user.full_name || "No name"}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </td>
                        <td className="p-3">{getStatusBadge(user)}</td>
                        <td className="p-3 text-sm">{new Date(user.created_at).toLocaleDateString()}</td>
                        <td className="p-3 text-sm">{user.assessmentCount}</td>
                        <td className="p-3 text-sm">{user.reportCount}</td>
                        <td className="p-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedUser(user)}>View Details</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => extendTrial(user.id, 7)}>
                                Extend Trial (+7 days)
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => extendTrial(user.id, 14)}>
                                Extend Trial (+14 days)
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => extendTrial(user.id, 30)}>
                                Extend Trial (+30 days)
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{user.full_name || "No name"}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      {getStatusBadge(user)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {user.assessmentCount} assessments
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent"
                      onClick={() => setSelectedUser(user)}
                    >
                      View Details
                    </Button>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * usersPerPage + 1} to {Math.min(currentPage * usersPerPage, totalUsers)}{" "}
                    of {totalUsers} users
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>View and manage user information</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-teal-100 rounded-full flex items-center justify-center text-2xl font-bold text-teal-600">
                  {selectedUser.full_name?.[0] || selectedUser.email?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-semibold">{selectedUser.full_name || "No name"}</p>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(selectedUser)}
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Joined</p>
                  <p className="text-sm font-medium">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Trial Ends</p>
                  <p className="text-sm font-medium">
                    {selectedUser.trial_ends_at ? new Date(selectedUser.trial_ends_at).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">NPI</p>
                  <p className="text-sm font-medium">{selectedUser.npi || "Not provided"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Assessments</p>
                  <p className="text-sm font-medium">{selectedUser.assessmentCount}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Reports</p>
                  <p className="text-sm font-medium">{selectedUser.reportCount}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-4 border-t">
                <p className="text-sm font-medium">Quick Actions</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => extendTrial(selectedUser.id, 7)}>
                    +7 Days Trial
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => extendTrial(selectedUser.id, 14)}>
                    +14 Days Trial
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => extendTrial(selectedUser.id, 30)}>
                    +30 Days Trial
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-fit bg-transparent"
                  onClick={() => window.open(`mailto:${selectedUser.email}`, "_blank")}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                {selectedUser.stripe_customer_id && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-fit bg-transparent"
                    onClick={() =>
                      window.open(`https://dashboard.stripe.com/customers/${selectedUser.stripe_customer_id}`, "_blank")
                    }
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    View in Stripe
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function UsersPage() {
  return (
    <Suspense fallback={null}>
      <UsersPageContent />
    </Suspense>
  )
}
