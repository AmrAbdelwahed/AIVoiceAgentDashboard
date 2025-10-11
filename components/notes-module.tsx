"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Search, Plus, StickyNote, User, Phone, Mail, Building, Pin, PinOff, Clock, RefreshCw, Trash2 } from "lucide-react"
import type { Customer, Note, FollowUp } from "@/lib/types/crm"

export function NotesModule() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [activeTab, setActiveTab] = useState("notes")

  // Form states
  const [showCustomerDialog, setShowCustomerDialog] = useState(false)
  const [showNoteDialog, setShowNoteDialog] = useState(false)
  const [customerForm, setCustomerForm] = useState({
    phone_number: "+1",
    name: "",
    email: "",
    company: "",
  })
  const [noteForm, setNoteForm] = useState({
    customer_id: "",
    title: "",
    content: "",
    priority: "medium" as "low" | "medium" | "high",
  })

  useEffect(() => {
    // Only do initial load with sync
    loadDataWithSync()
  }, [])

  const loadDataWithSync = async () => {
    try {
      setLoading(true)
      
      // First, sync with Airtable
      await syncAirtableData()
      
      // Then fetch all data (including newly synced customers)
      await fetchData()
      
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteNote = async (noteId: string) => {
  try {
    const response = await fetch(`/api/crm/notes/${noteId}`, {
      method: "DELETE",
    })

    if (response.ok) {
      setNotes(notes.filter((note) => note.id !== noteId))
    }
  } catch (error) {
    console.error("Error deleting note:", error)
  }
}

  const fetchData = async () => {
  try {
    // Add cache-busting timestamp to prevent stale data
    const timestamp = Date.now()
    const [customersRes, notesRes] = await Promise.all([
      fetch(`/api/crm/customers?limit=1000&_t=${timestamp}`),
      fetch(`/api/crm/notes?_t=${timestamp}`)
    ])

    if (customersRes.ok) {
      const customersData = await customersRes.json()
      console.log("✅ Fetched customers:", customersData.customers?.length || 0)
      setCustomers(customersData.customers || [])
    } else {
      console.error("❌ Failed to fetch customers:", await customersRes.text())
    }

    if (notesRes.ok) {
      const notesData = await notesRes.json()
      console.log("✅ Fetched notes:", notesData.notes?.length || 0)
      setNotes(notesData.notes || [])
    }
  } catch (error) {
    console.error("❌ Error fetching CRM data:", error)
  }
}

const syncAirtableData = async () => {
  try {
    setSyncing(true)
    console.log("🔄 Starting Airtable sync...")
    
    const response = await fetch("/api/crm/sync-airtable", {
      method: "POST",
    })

    if (response.ok) {
      const result = await response.json()
      console.log("✅ Airtable sync complete:", result.summary)
      
      if (result.skippedRecords && result.skippedRecords.length > 0) {
        console.warn("⚠️ Skipped records:", result.skippedRecords)
      }
      
      // Wait a bit for DB to commit, then refetch
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Refetch customers to update UI
      await fetchData()
      console.log("🔄 UI refreshed after sync")
      
    } else {
      console.error("❌ Airtable sync failed:", await response.text())
    }
  } catch (error) {
    console.error("❌ Error syncing Airtable:", error)
  } finally {
    setSyncing(false)
  }
}

const handleManualRefresh = async () => {
  // Just call syncAirtableData - it handles everything
  await syncAirtableData()
}

  const createCustomer = async () => {
    try {
      const response = await fetch("/api/crm/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerForm),
      })

      if (response.ok) {
        const { customer } = await response.json()
        setCustomers([customer, ...customers])
        setCustomerForm({ phone_number: "+1", name: "", email: "", company: "" })
        setShowCustomerDialog(false)
      }
    } catch (error) {
      console.error("Error creating customer:", error)
    }
  }

  const createNote = async () => {
    try {
      const response = await fetch("/api/crm/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(noteForm),
      })

      if (response.ok) {
        const { note } = await response.json()
        setNotes([note, ...notes])
        setNoteForm({ customer_id: "", title: "", content: "", priority: "medium" })
        setShowNoteDialog(false)
      }
    } catch (error) {
      console.error("Error creating note:", error)
    }
  }

  const togglePinNote = async (noteId: string, isPinned: boolean) => {
    try {
      const response = await fetch(`/api/crm/notes/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_pinned: !isPinned }),
      })

      if (response.ok) {
        setNotes(notes.map((note) => (note.id === noteId ? { ...note, is_pinned: !isPinned } : note)))
      }
    } catch (error) {
      console.error("Error toggling pin:", error)
    }
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      !searchTerm ||
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone_number.includes(searchTerm) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredNotes = notes.filter(
    (note) =>
      !searchTerm ||
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Notes & CRM
            </h1>
            <p className="text-slate-400 mt-2">
              Loading and syncing with Airtable...
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 animate-pulse"
            >
              <div className="h-4 bg-slate-700/50 rounded mb-4"></div>
              <div className="h-8 bg-slate-700/50 rounded mb-2"></div>
              <div className="h-4 bg-slate-700/50 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Notes & CRM
          </h1>
          <p className="text-slate-400 mt-2">
            Manage customer relationships and call notes
            {syncing && (
              <span className="ml-2 text-xs text-blue-400 animate-pulse">
                • Syncing with Airtable...
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-blue-400 bg-transparent"
              >
                <User className="w-4 h-4 mr-2" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 text-white">
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Phone Number *"
                  value={customerForm.phone_number}
                  onChange={(e) => {
                    let input = e.target.value;

                    // If the user tries to delete '+1', restore it
                    if (!input.startsWith('+1')) {
                      input = '+1' + input.replace(/[^0-9]/g, '').replace(/^1+/, '');
                    }

                    setCustomerForm({ ...customerForm, phone_number: input });
                  }}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                />

                <Input
                  placeholder="Name"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                />
                <Input
                  placeholder="Company"
                  value={customerForm.company}
                  onChange={(e) => setCustomerForm({ ...customerForm, company: e.target.value })}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                />
                <Button
                  onClick={createCustomer}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  Create Customer
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Note
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 text-white">
              <DialogHeader>
                <DialogTitle>Add New Note</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Select
                  value={noteForm.customer_id}
                  onValueChange={(value) => setNoteForm({ ...noteForm, customer_id: value })}
                >
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue placeholder="Select Customer" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name || customer.phone_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Note Title *"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                />
                <Textarea
                  placeholder="Note Content *"
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 min-h-[100px]"
                />
                <Select
                  value={noteForm.priority}
                  onValueChange={(value: any) => setNoteForm({ ...noteForm, priority: value })}
                >
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={createNote}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  Create Note
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            onClick={handleManualRefresh}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-blue-400 bg-transparent"
            disabled={syncing}
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <Input
          placeholder="Search customers, notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border-slate-700">
          <TabsTrigger value="notes" className="data-[state=active]:bg-blue-600">
            <StickyNote className="w-4 h-4 mr-2" />
            Notes ({notes.length})
          </TabsTrigger>
          <TabsTrigger value="customers" className="data-[state=active]:bg-purple-600">
            <User className="w-4 h-4 mr-2" />
            Customers ({customers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notes" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <Card
                  key={note.id}
                  className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg line-clamp-1">{note.title}</CardTitle>
                        <p className="text-sm text-slate-400 mt-1">
                          {note.customer?.name || note.customer?.phone_number}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => togglePinNote(note.id, note.is_pinned)}
                          className="text-slate-400 hover:text-white p-1"
                        >
                          {note.is_pinned ? (
                            <Pin className="w-4 h-4 text-yellow-400" />
                          ) : (
                            <PinOff className="w-4 h-4" />
                          )}
                        </Button>
                        <Badge className={getPriorityColor(note.priority)}>{note.priority}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 text-sm line-clamp-3 mb-4">{note.content}</p>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(note.created_at).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-2">
                        {note.is_pinned && <Pin className="w-3 h-3 text-yellow-400" />}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNote(note.id)
                          }}
                          className="text-slate-400 hover:text-red-400 p-1 h-auto"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-slate-400">
                <StickyNote className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No notes found</p>
                <p className="text-sm">Create your first note to get started</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <Card
                  key={customer.id}
                  className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <Badge
                        className={
                          customer.status === "active"
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : "bg-slate-500/20 text-slate-400 border-slate-500/30"
                        }
                      >
                        {customer.status}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold text-white">{customer.name || "Unknown Name"}</h3>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Phone className="w-3 h-3" />
                        {customer.phone_number}
                      </div>
                      {customer.email && (
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Mail className="w-3 h-3" />
                          {customer.email}
                        </div>
                      )}
                      {customer.company && (
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Building className="w-3 h-3" />
                          {customer.company}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Added {new Date(customer.created_at).toLocaleDateString()}</span>
                        <span>{notes.filter((n) => n.customer_id === customer.id).length} notes</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-slate-400">
                <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No customers found</p>
                <p className="text-sm">Add your first customer to get started</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}