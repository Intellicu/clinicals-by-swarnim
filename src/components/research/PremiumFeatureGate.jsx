import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Crown, Sparkles } from "lucide-react";

/**
 * Wraps a premium feature with a locked preview for non-admin users.
 * Shows the feature name and a "Premium Feature" label — never hides entirely.
 */
export default function PremiumFeatureGate({ hasAccess, featureName, description, icon: Icon, children }) {
  if (hasAccess) return children;

  return (
    <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
      <CardContent className="p-8 text-center">
        <div className="relative inline-flex items-center justify-center w-20 h-20 mx-auto mb-4">
          <div className="w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center">
            {Icon ? <Icon className="w-10 h-10 text-amber-400" /> : <Sparkles className="w-10 h-10 text-amber-400" />}
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
            <Lock className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <h3 className="text-xl font-bold text-slate-800">{featureName}</h3>
          <Badge className="bg-amber-500 text-white gap-1">
            <Crown className="w-3 h-3" />Premium Feature
          </Badge>
        </div>
        <p className="text-sm text-slate-600 mb-4 max-w-md mx-auto">{description || "This feature is available for premium users. Contact your administrator for access."}</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-amber-300 rounded-xl text-sm text-amber-700 font-medium">
          <Crown className="w-4 h-4" />
          Available for Admin / Premium Users
        </div>
        <p className="text-xs text-slate-400 mt-3">Feature preview shown — upgrade to unlock full functionality</p>
      </CardContent>
    </Card>
  );
}