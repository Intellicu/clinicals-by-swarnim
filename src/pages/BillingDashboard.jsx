import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { IndianRupee, Plus, Printer, TrendingUp, Clock, CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { toast } from 'sonner';

const STATUS_STYLE = {
  Pending: 'bg-amber-100 text-amber-700',
  Partial: 'bg-blue-100 text-blue-700',
  Paid: 'bg-green-100 text-green-700'
};

function NewBillDialog({ patients, onCreated }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    patient_id: '', visit_date: format(new Date(), 'yyyy-MM-dd'),
    payment_method: 'Cash', notes: ''
  });
  const [items, setItems] = useState([{ description: 'Consultation Fee', amount: 500 }]);

  const total = items.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const patient = patients.find(p => p.id === form.patient_id);

  const mutation = useMutation({
    mutationFn: () => base44.entities.Billing.create({
      ...form, patient_name: patient?.patient_name || '',
      service_items: items, total_amount: total, amount_paid: 0,
      payment_status: 'Pending', receipt_generated: false
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing'] });
      setOpen(false);
      setForm({ patient_id: '', visit_date: format(new Date(), 'yyyy-MM-dd'), payment_method: 'Cash', notes: '' });
      setItems([{ description: 'Consultation Fee', amount: 500 }]);
      onCreated?.();
      toast.success('Bill created!');
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-green-600 hover:bg-green-700"><Plus className="w-4 h-4" />New Bill</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Create Bill</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-xs">Patient *</Label>
            <Select value={form.patient_id} onValueChange={v => setForm(p => ({ ...p, patient_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
              <SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.patient_name} — {p.cr_number}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Visit Date</Label>
              <Input type="date" value={form.visit_date} onChange={e => setForm(p => ({ ...p, visit_date: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs">Payment Method</Label>
              <Select value={form.payment_method} onValueChange={v => setForm(p => ({ ...p, payment_method: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['Cash', 'UPI', 'Card', 'Online', 'Waived'].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs">Service Items</Label>
              <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => setItems(p => [...p, { description: '', amount: 0 }])}>+ Add</Button>
            </div>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={item.description} placeholder="Service" onChange={e => { const n = [...items]; n[i].description = e.target.value; setItems(n); }} />
                  <Input type="number" value={item.amount} className="w-28" placeholder="₹" onChange={e => { const n = [...items]; n[i].amount = Number(e.target.value); setItems(n); }} />
                  <Button size="sm" variant="ghost" onClick={() => setItems(items.filter((_, j) => j !== i))}><Trash2 className="w-3 h-3 text-red-500" /></Button>
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 bg-slate-50 rounded-lg flex justify-between font-bold">
              <span>Total</span><span>₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <Button onClick={() => mutation.mutate()} disabled={!form.patient_id || mutation.isPending} className="w-full bg-green-600">
            {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Create Bill
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ReceiptModal({ bill, onClose }) {
  const queryClient = useQueryClient();
  const [paid, setPaid] = useState(bill.amount_paid || 0);

  const markPaidMutation = useMutation({
    mutationFn: () => base44.entities.Billing.update(bill.id, {
      amount_paid: paid,
      payment_status: paid >= bill.total_amount ? 'Paid' : paid > 0 ? 'Partial' : 'Pending',
      receipt_generated: true
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing'] });
      toast.success('Payment recorded!');
      onClose();
    }
  });

  const printReceipt = () => {
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Receipt</title><style>
        body { font-family: Arial, sans-serif; padding: 30px; max-width: 500px; margin: auto; }
        h2 { text-align: center; color: #1e3a5f; }
        .row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dotted #ccc; }
        .total { font-weight: bold; font-size: 18px; margin-top: 12px; }
        .footer { text-align: center; margin-top: 30px; color: #888; font-size: 12px; }
      </style></head><body>
      <h2>PAYMENT RECEIPT</h2>
      <p style="text-align:center;color:#666;">Date: ${format(new Date(bill.visit_date || bill.created_date), 'dd MMM yyyy')}</p>
      <hr/>
      <p><strong>Patient:</strong> ${bill.patient_name}</p>
      <hr/>
      ${bill.service_items?.map(i => `<div class="row"><span>${i.description}</span><span>₹${i.amount}</span></div>`).join('') || ''}
      <div class="row total"><span>Total</span><span>₹${bill.total_amount}</span></div>
      <div class="row" style="color:green"><span>Paid</span><span>₹${paid}</span></div>
      ${paid < bill.total_amount ? `<div class="row" style="color:orange"><span>Balance</span><span>₹${bill.total_amount - paid}</span></div>` : ''}
      <p><strong>Payment Method:</strong> ${bill.payment_method}</p>
      <div class="footer">Thank you for visiting us.<br/>This is a computer-generated receipt.</div>
      </body></html>
    `);
    win.print();
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-xl p-4 bg-slate-50">
        <h3 className="font-bold text-lg mb-3">Receipt — {bill.patient_name}</h3>
        {bill.service_items?.map((item, i) => (
          <div key={i} className="flex justify-between text-sm py-1 border-b">
            <span>{item.description}</span><span>₹{item.amount}</span>
          </div>
        ))}
        <div className="flex justify-between font-bold mt-2 text-lg">
          <span>Total</span><span>₹{bill.total_amount}</span>
        </div>
      </div>
      <div>
        <Label className="text-xs">Amount Paid (₹)</Label>
        <Input type="number" value={paid} onChange={e => setPaid(Number(e.target.value))} max={bill.total_amount} />
      </div>
      <div className="flex gap-2">
        <Button onClick={printReceipt} variant="outline" className="gap-2 flex-1"><Printer className="w-4 h-4" />Print</Button>
        <Button onClick={() => markPaidMutation.mutate()} className="flex-1 bg-green-600 gap-2">
          {markPaidMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          Save Payment
        </Button>
      </div>
    </div>
  );
}

export default function BillingDashboard() {
  const [selectedBill, setSelectedBill] = useState(null);
  const [monthOffset, setMonthOffset] = useState(0);

  const { data: bills = [] } = useQuery({ queryKey: ['billing'], queryFn: () => base44.entities.Billing.list('-visit_date', 200) });
  const { data: patients = [] } = useQuery({ queryKey: ['patients'], queryFn: () => base44.entities.Patient.list('-created_date', 200) });

  const targetMonth = new Date(new Date().getFullYear(), new Date().getMonth() + monthOffset, 1);
  const monthStart = startOfMonth(targetMonth);
  const monthEnd = endOfMonth(targetMonth);

  const monthBills = bills.filter(b => {
    const d = new Date(b.visit_date || b.created_date);
    return isWithinInterval(d, { start: monthStart, end: monthEnd });
  });

  const totalRevenue = monthBills.reduce((s, b) => s + (b.amount_paid || 0), 0);
  const totalPending = monthBills.reduce((s, b) => s + (b.total_amount - (b.amount_paid || 0)), 0);
  const totalBilled = monthBills.reduce((s, b) => s + b.total_amount, 0);

  // Weekly chart data
  const weekData = [0, 1, 2, 3].map(w => {
    const start = new Date(monthStart); start.setDate(start.getDate() + w * 7);
    const end = new Date(start); end.setDate(end.getDate() + 6);
    const weekBills = monthBills.filter(b => {
      const d = new Date(b.visit_date || b.created_date);
      return d >= start && d <= end;
    });
    return { name: `Wk ${w + 1}`, revenue: weekBills.reduce((s, b) => s + (b.amount_paid || 0), 0) };
  });

  return (
    <div className="max-w-5xl mx-auto p-4 pb-24">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <IndianRupee className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Billing & Payments</h1>
            <p className="text-xs text-slate-500">{format(targetMonth, 'MMMM yyyy')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setMonthOffset(p => p - 1)}>‹</Button>
          <Button variant="outline" size="sm" onClick={() => setMonthOffset(p => p + 1)} disabled={monthOffset >= 0}>›</Button>
          <NewBillDialog patients={patients} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-700">₹{totalRevenue.toLocaleString('en-IN')}</div>
            <div className="text-xs text-green-600">Collected</div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-700">₹{totalPending.toLocaleString('en-IN')}</div>
            <div className="text-xs text-amber-600">Pending</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">{monthBills.length}</div>
            <div className="text-xs text-blue-600">Bills</div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="mb-6">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Revenue This Month</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weekData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={v => [`₹${v}`, 'Revenue']} />
              <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                {weekData.map((_, i) => <Cell key={i} fill="#22c55e" />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bills List */}
      <div className="space-y-2">
        {monthBills.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <IndianRupee className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p>No bills for this month</p>
          </div>
        ) : monthBills.map(bill => (
          <Card key={bill.id} className="hover:shadow-sm transition-shadow cursor-pointer" onClick={() => setSelectedBill(bill)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-sm">{bill.patient_name}</p>
                  <p className="text-xs text-slate-500">{bill.visit_date} · {bill.payment_method}</p>
                  {bill.service_items?.length > 0 && (
                    <p className="text-xs text-slate-400">{bill.service_items.map(i => i.description).join(', ')}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold">₹{bill.total_amount?.toLocaleString('en-IN')}</p>
                  <Badge className={`${STATUS_STYLE[bill.payment_status]} text-xs mt-1`}>{bill.payment_status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Receipt modal */}
      <Dialog open={!!selectedBill} onOpenChange={() => setSelectedBill(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Manage Bill</DialogTitle></DialogHeader>
          {selectedBill && <ReceiptModal bill={selectedBill} onClose={() => setSelectedBill(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}