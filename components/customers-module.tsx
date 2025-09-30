"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Phone,
  Mail,
  Building,
  Tag,
  Users,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"

interface Customer {
  id: string
  phone_number: string
  name?: string
  email?: string
  company?: string
  tags?: string[]
  status: "active" | "inactive" | "blocked"
  created_at: string
  updated_at: string
}

interface CustomerFormData {
  phone_number: string
  name: string
  email: string
  company: string
  tags: string[]
  status: "active" | "inactive" | "blocked"
}

interface CustomersModuleProps {
  className?: string
}

export function CustomersModule({ className }: CustomersModuleProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [refreshing, setRefreshing] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCustomers, setTotalCustomers] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const itemsPerPage = 20

  // Form state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState<CustomerFormData>({
    phone_number: "",
    name: "",
    email: "",
    company: "",
    tags: [],
    status: "active",
  })
  const [formErrors, setFormErrors] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  // Delete confirmation
  const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchCustomers()
  }, [currentPage, searchTerm, statusFilter])

  const fetchCustomers = async () => {
    try {
      setLoading(customers.length === 0) // Only show loading on initial load
      setRefreshing(customers.length > 0) // Show refreshing on subsequent loads
      setError(null)

      const params = new URLSearchParams({
        limit: itemsPerPage.toString(),
        offset: ((currentPage - 1) * itemsPerPage).toString(),
      })

      if (searchTerm) params.append("search", searchTerm)
      if (statusFilter !== "all") params.append("status", statusFilter)

      const response = await fetch(`/api/crm/customers?${params.toString()}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch customers")
      }

      const data = await response.json()
      setCustomers(data.customers || [])
      setTotalCustomers(data.pagination?.total || 0)
      setHasMore(data.pagination?.hasMore || false)
    } catch (err) {
      console.error("Error fetching customers:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch customers")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setCurrentPage(1)
    await fetchCustomers()
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const resetForm = () => {
    setFormData({
      phone_number: "",
      name: "",
      email: "",
      company: "",
      tags: [],
      status: "active",
    })
    setFormErrors([])
  }

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setFormErrors([])

    try {
      const response = await fetch("/api/crm/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.details) {
          setFormErrors(data.details)
        } else {
          setFormErrors([data.error || "Failed to create customer"])
        }
        return
      }

      setCustomers([data.customer, ...customers])
      setTotalCustomers(totalCustomers + 1)
      setIsCreateDialogOpen(false)
      resetForm()
    } catch (err) {
      setFormErrors(["Failed to create customer. Please try again."])
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCustomer) return

    setSubmitting(true)
    setFormErrors([])

    try {
      const response = await fetch(`/api/crm/customers/${editingCustomer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.details) {
          setFormErrors(data.details)
        } else {
          setFormErrors([data.error || "Failed to update customer"])
        }
        return
      }

      setCustomers(customers.map((c) => (c.id === editingCustomer.id ? data.customer : c)))
      setIsEditDialogOpen(false)
      setEditingCustomer(null)
      resetForm()
    } catch (err) {
      setFormErrors(["Failed to update customer. Please try again."])
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteCustomer = async () => {
    if (!deleteCustomer) return

    setDeleting(true)

    try {
      const response = await fetch(`/api/crm/customers/${deleteCustomer.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete customer")
      }

      setCustomers(customers.filter((c) => c.id !== deleteCustomer.id))
      setTotalCustomers(totalCustomers - 1)
      setDeleteCustomer(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete customer")
    } finally {
      setDeleting(false)
    }
  }

  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer)
    setFormData({
      phone_number: customer.phone_number,
      name: customer.name || "",
      email: customer.email || "",
      company: customer.company || "",
      tags: customer.tags || [],
      status: customer.status,
    })
    setIsEditDialogOpen(true)
  }

  const handleTagsChange = (value: string) => {
    const tags = value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
    setFormData({ ...formData, tags })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case "inactive":
        return <Clock className="w-4 h-4 text-yellow-400" />
      case "blocked":
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return <AlertCircle className="w-4 h-4 text-slate-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
      case "inactive":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Inactive</Badge>
      case "blocked":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Blocked</Badge>
      default:
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">Unknown</Badge>
    }
  }

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Customer Management
            </h2>
            <p className="text-slate-400 mt-1">Manage your customer database</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-1 bg-slate-700/50" />
          <Skeleton className="h-10 w-32 bg-slate-700/50" />
          <Skeleton className="h-10 w-32 bg-slate-700/50" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-32 bg-slate-700/50" />
                  <Skeleton className="h-6 w-16 bg-slate-700/50" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full bg-slate-700/50" />
                  <Skeleton className="h-4 w-3/4 bg-slate-700/50" />
                  <Skeleton className="h-4 w-1/2 bg-slate-700/50" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Customer Management
          </h2>
          <p className="text-slate-400 mt-1">Manage your customer database</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-blue-400 bg-transparent"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={resetForm}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateCustomer} className="space-y-4">
                {formErrors.length > 0 && (
                  <Alert className="border-red-500/30">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-300">
                      <ul className="list-disc list-inside space-y-1">
                        {formErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number *</Label>
                  <Input
                    id="phone_number"
                    type="tel"
                    placeholder="+1234567890"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="bg-slate-700/50 border-slate-600 text-white"
                    required
                  />
                  <p className="text-xs text-slate-400">Use E.164 format (e.g., +1234567890)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    placeholder="Acme Corp"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    placeholder="vip, premium, support (comma-separated)"
                    value={formData.tags.join(", ")}
                    onChange={(e) => handleTagsChange(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700/50 bg-transparent"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    {submitting ? "Creating..." : "Create Customer"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search customers by name, phone, email, or company..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
          />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-32 bg-slate-800/50 border-slate-600 text-white">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalCustomers}</p>
                <p className="text-sm text-slate-400">Total Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{customers.filter((c) => c.status === "active").length}</p>
                <p className="text-sm text-slate-400">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Filter className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{customers.length}</p>
                <p className="text-sm text-slate-400">Filtered Results</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Alert className="border-red-500/30">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300">{error}</AlertDescription>
        </Alert>
      )}

      {/* Customer Grid */}
      {customers.length === 0 ? (
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              {searchTerm || statusFilter !== "all" ? "No customers found" : "No customers yet"}
            </h3>
            <p className="text-slate-400 mb-4">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search terms or filters."
                : "Get started by adding your first customer."}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Button
                onClick={() => {
                  resetForm()
                  setIsCreateDialogOpen(true)
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Customer
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customers.map((customer) => (
              <Card
                key={customer.id}
                className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover:border-blue-500/30 transition-colors"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">{customer.name || "Unnamed Customer"}</CardTitle>
                        {getStatusBadge(customer.status)}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-slate-800 border-slate-700" align="end">
                        <DropdownMenuItem
                          onClick={() => openEditDialog(customer)}
                          className="text-slate-300 hover:bg-slate-700 hover:text-white"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-700" />
                        <DropdownMenuItem
                          onClick={() => setDeleteCustomer(customer)}
                          className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">{customer.phone_number}</span>
                  </div>

                  {customer.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300 truncate">{customer.email}</span>
                    </div>
                  )}

                  {customer.company && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300 truncate">{customer.company}</span>
                    </div>
                  )}

                  {customer.tags && customer.tags.length > 0 && (
                    <div className="flex items-start gap-2 text-sm">
                      <Tag className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div className="flex flex-wrap gap-1">
                        {customer.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-slate-600 text-slate-300">
                            {tag}
                          </Badge>
                        ))}
                        {customer.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                            +{customer.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-700/50">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Created: {new Date(customer.created_at).toLocaleDateString()}</span>
                      <span>Updated: {new Date(customer.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalCustomers > itemsPerPage && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-400">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalCustomers)}{" "}
                of {totalCustomers} customers
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-blue-400 bg-transparent"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, Math.ceil(totalCustomers / itemsPerPage)) }, (_, i) => {
                    const page = i + 1
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={
                          currentPage === page
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                            : "border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-blue-400 bg-transparent"
                        }
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!hasMore}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-blue-400 bg-transparent"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditCustomer} className="space-y-4">
            {formErrors.length > 0 && (
              <Alert className="border-red-500/30">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-300">
                  <ul className="list-disc list-inside space-y-1">
                    {formErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit_phone_number">Phone Number *</Label>
              <Input
                id="edit_phone_number"
                type="tel"
                placeholder="+1234567890"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="bg-slate-700/50 border-slate-600 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_name">Name</Label>
              <Input
                id="edit_name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_email">Email</Label>
              <Input
                id="edit_email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_company">Company</Label>
              <Input
                id="edit_company"
                placeholder="Acme Corp"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_tags">Tags</Label>
              <Input
                id="edit_tags"
                placeholder="vip, premium, support (comma-separated)"
                value={formData.tags.join(", ")}
                onChange={(e) => handleTagsChange(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setEditingCustomer(null)
                  resetForm()
                }}
                className="border-slate-600 text-slate-300 hover:bg-slate-700/50 bg-transparent"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                {submitting ? "Updating..." : "Update Customer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteCustomer} onOpenChange={() => setDeleteCustomer(null)}>
        <AlertDialogContent className="bg-slate-800 border-slate-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              Are you sure you want to delete{" "}
              <span className="font-medium text-white">{deleteCustomer?.name || deleteCustomer?.phone_number}</span>?
              This action cannot be undone and will also delete all associated notes and follow-ups.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setDeleteCustomer(null)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700/50 bg-transparent"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCustomer}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? "Deleting..." : "Delete Customer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
