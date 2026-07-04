import React, { useState } from "react";
import { base44 } from "@/api/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Package, AlertTriangle, Plus, Minus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

export default function InventoryManager() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newItem, setNewItem] = useState({
    item_name: "",
    category: "Medicine",
    quantity: 0,
    unit: "",
    unit_cost: 0,
    reorder_level: 10
  });

  const queryClient = useQueryClient();

  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => base44.entities.Inventory.list('-created_date'),
    initialData: []
  });

  const createItemMutation = useMutation({
    mutationFn: (itemData) => base44.entities.Inventory.create(itemData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setShowAddDialog(false);
      toast.success("Item added!");
    }
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ id, quantity }) => base44.entities.Inventory.update(id, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success("Quantity updated!");
    }
  });

  const lowStockItems = inventory.filter(item => item.quantity <= item.reorder_level);

  return (
    <div className="space-y-6">
      {lowStockItems.length > 0 && (
        <Alert className="bg-amber-50 border-amber-300">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-amber-900">
            <strong>{lowStockItems.length} items</strong> are at or below reorder level
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Inventory
            </CardTitle>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Inventory Item</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Item Name *</Label>
                    <Input
                      value={newItem.item_name}
                      onChange={(e) => setNewItem({...newItem, item_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select value={newItem.category} onValueChange={(val) => setNewItem({...newItem, category: val})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Medicine">Medicine</SelectItem>
                        <SelectItem value="Consumable">Consumable</SelectItem>
                        <SelectItem value="Equipment">Equipment</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Quantity *</Label>
                      <Input
                        type="number"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem({...newItem, quantity: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label>Unit</Label>
                      <Input
                        placeholder="tablets, boxes, etc"
                        value={newItem.unit}
                        onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Unit Cost *</Label>
                      <Input
                        type="number"
                        value={newItem.unit_cost}
                        onChange={(e) => setNewItem({...newItem, unit_cost: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label>Reorder Level *</Label>
                      <Input
                        type="number"
                        value={newItem.reorder_level}
                        onChange={(e) => setNewItem({...newItem, reorder_level: parseFloat(e.target.value)})}
                      />
                    </div>
                  </div>
                  <Button onClick={() => createItemMutation.mutate(newItem)} className="w-full">
                    Add Item
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {inventory.map(item => (
              <div key={item.id} className={`border rounded p-3 ${item.quantity <= item.reorder_level ? 'bg-amber-50 border-amber-300' : ''}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold">{item.item_name}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">{item.category}</Badge>
                      <Badge className={item.quantity <= item.reorder_level ? "bg-amber-600" : "bg-green-600"}>
                        {item.quantity} {item.unit}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">₹{item.unit_cost} per {item.unit}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantityMutation.mutate({ id: item.id, quantity: item.quantity - 1 })}
                      disabled={item.quantity <= 0}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantityMutation.mutate({ id: item.id, quantity: item.quantity + 1 })}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}