"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Building2,
  Users,
  FileText,
  Search,
  RefreshCw,
  ArrowLeft,
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface BaaRequest {
  id: string
  organization_name: string
  contact_name: string
  email: string
  phone: string | null
  organization_type: string
  number_of_bcbas: number | null
  message: string | null
  authorized: boolean
  status: "pending" | "approved" | "rejected"
  created_at: string
  processed_at: string | null
  notes: string | null
}

export default function BaaAdminPage() {
  const [requests, setRequests] = useState<BaaRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<BaaRequest | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [adminNotes, setAdminNotes] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [updating, setUpdating] = useState(false)

  const fetchRequests = async () => {
    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase.from("baa_requests").select("*").order("created_at", { ascending: false })

    if (!error && data) {
      setRequests(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    setUpdating(true)
    const supabase = createClient()

    const { error } = await supabase
      .from("baa_requests")
      .update({
        status,
        processed_at: new Date().toISOString(),
        notes: adminNotes,
      })
      .eq("id", id)

    if (!error) {
      setDialogOpen(false)
      setAdminNotes("")
      fetchRequests()
    }
    setUpdating(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="w-3 h-3 mr-1" /> Rejected
          </Badge>
        )
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </Badge>
        )
    }
  }

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.organization_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || req.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold">BAA Requests</h1>
            <p className="text-muted-foreground">Manage Business Associate Agreement requests</p>
          </div>
          <Button onClick={fetchRequests} variant="outline" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by organization, contact, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {["all", "pending", "approved", "rejected"].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="hidden md:table-cell">Type</TableHead>
                    <TableHead className="hidden md:table-cell">BCBAs</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-muted-foreground hidden sm:block" />
                            <span className="font-medium">{req.organization_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p>{req.contact_name}</p>
                            <p className="text-sm text-muted-foreground">{req.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{req.organization_type}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {req.number_of_bcbas || "-"}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(req.status)}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {format(new Date(req.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(req)
                              setAdminNotes(req.notes || "")
                              setDialogOpen(true)
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" /> View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>BAA Request Details</DialogTitle>
            </DialogHeader>

            {selectedRequest && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Organization</label>
                    <p className="font-medium">{selectedRequest.organization_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Type</label>
                    <p className="font-medium">{selectedRequest.organization_type}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Contact Name</label>
                    <p className="font-medium">{selectedRequest.contact_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Email</label>
                    <p className="font-medium">{selectedRequest.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Phone</label>
                    <p className="font-medium">{selectedRequest.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Number of BCBAs</label>
                    <p className="font-medium">{selectedRequest.number_of_bcbas || "Not specified"}</p>
                  </div>
                </div>

                {selectedRequest.message && (
                  <div>
                    <label className="text-sm text-muted-foreground">Message</label>
                    <p className="font-medium bg-muted p-3 rounded-lg">{selectedRequest.message}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm text-muted-foreground">Current Status</label>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>

                {selectedRequest.status === "pending" && (
                  <>
                    <div>
                      <label className="text-sm text-muted-foreground">Admin Notes</label>
                      <Textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add notes about this request..."
                        rows={3}
                      />
                    </div>

                    <DialogFooter className="gap-2">
                      <Button
                        variant="destructive"
                        onClick={() => updateStatus(selectedRequest.id, "rejected")}
                        disabled={updating}
                      >
                        <XCircle className="w-4 h-4 mr-2" /> Reject
                      </Button>
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => updateStatus(selectedRequest.id, "approved")}
                        disabled={updating}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                      </Button>
                    </DialogFooter>
                  </>
                )}

                {selectedRequest.notes && selectedRequest.status !== "pending" && (
                  <div>
                    <label className="text-sm text-muted-foreground">Admin Notes</label>
                    <p className="font-medium bg-muted p-3 rounded-lg">{selectedRequest.notes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
