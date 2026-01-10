import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DollarSign, TrendingUp, AlertCircle, CreditCard, Plus } from "lucide-react";
import { toast } from "sonner";

export default function BillingDashboard({ patientId }) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newBill, setNewBill] = useState({
    patient_id: patientId || "",
    services: [{ service_name: "", cost: 0, quantity: 1 }],
    payment_method: "",
    payment_status: "Pending"
  });

  const queryClient = useQueryClient();

  const { data: billings = [] } = useQuery({
    queryKey: ['billings', patientId, dateFrom, dateTo],
    queryFn: async () => {
      let bills = patientId
        ? await base44.entities.Billing.filter({ patient_id: patientId }, '-created_date')
        : await base44.entities.Billing.list('-created_date');
      
      if (dateFrom || dateTo) {
        bills = bills.filter(b => {
          const billDate = new Date(b.created_date);
          if (dateFrom && billDate < new Date(dateFrom)) return false;
          if (dateTo && billDate > new Date(dateTo)) return false;
          return true;
        });
      }
      return bills;
    },
    initialData: []
  });

  const createBillingMutation = useMutation({
    mutationFn: (billData) => {
      const total = billData.services.reduce((sum, s) => sum + (s.cost * s.quantity), 0);
      return base44.entities.Billing.create({
        ...billData,
        total_amount: total,
        amount_paid: billData.payment_status === "Paid" ? total : 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billings'] });
      setShowAddDialog(false);
      toast.success("Bill created!");
    }
  });

  const totalRevenue = billings.reduce((sum, b) => sum + (b.amount_paid || 0), 0);
  const outstandingAmount = billings.reduce((sum, b) => sum + (b.total_amount - (b.amount_paid || 0)), 0);
  const paidBills = billings.filter(b => b.payment_status === "Paid").length;

  const addService = () => {
    setNewBill(prev => ({
      ...prev,
      services: [...prev.services, { service_name: "", cost: 0, quantity: 1 }]
    }));
  };

  const updateService = (index, field, value) => {
    setNewBill(prev => ({
      ...prev,
      services: prev.services.map((s, i) => i === index ? { ...s, [field]: value } : s)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Total Revenue</p>
                <p className="text-2xl font-bold text-green-900">₹{totalRevenue.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700">Outstanding</p>
                <p className="text-2xl font-bold text-amber-900">₹{outstandingAmount.toLocaleString()}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Paid Bills</p>
                <p className="text-2xl font-bold text-blue-900">{paidBills}/{billings.length}</p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Billing Records
            </CardTitle>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-green-600">
                  <Plus className="w-4 h-4 mr-2" />
                  New Bill
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Bill</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Services</Label>
                    {newBill.services.map((service, idx) => (
                      <div key={idx} className="grid grid-cols-3 gap-2 mt-2">
                        <Input
                          placeholder="Service name"
                          value={service.service_name}
                          onChange={(e) => updateService(idx, 'service_name', e.target.value)}
                        />
                        <Input
                          type="number"
                          placeholder="Cost"
                          value={service.cost}
                          onChange={(e) => updateService(idx, 'cost', parseFloat(e.target.value))}
                        />
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={service.quantity}
                          onChange={(e) => updateService(idx, 'quantity', parseInt(e.target.value))}
                        />
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={addService} className="mt-2">
                      + Add Service
                    </Button>
                  </div>
                  <div>
                    <Label>Payment Method</Label>
                    <Select value={newBill.payment_method} onValueChange={(val) => setNewBill({...newBill, payment_method: val})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Card">Card</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="Insurance">Insurance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Payment Status</Label>
                    <Select value={newBill.payment_status} onValueChange={(val) => setNewBill({...newBill, payment_status: val})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={() => createBillingMutation.mutate(newBill)} className="w-full">
                    Create Bill
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} placeholder="From" />
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder="To" />
          </div>
          <div className="space-y-2">
            {billings.map(bill => (
              <div key={bill.id} className="border rounded p-3 flex justify-between items-center">
                <div>
                  <p className="font-semibold">₹{bill.total_amount}</p>
                  <p className="text-xs text-slate-600">{new Date(bill.created_date).toLocaleDateString()}</p>
                </div>
                <Badge className={
                  bill.payment_status === "Paid" ? "bg-green-600" :
                  bill.payment_status === "Partial" ? "bg-amber-600" : "bg-red-600"
                }>
                  {bill.payment_status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}