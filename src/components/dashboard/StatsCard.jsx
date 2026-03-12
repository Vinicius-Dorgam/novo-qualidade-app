import React from 'react';
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function StatsCard({ title, value, subtitle, icon: IconComponent, trend, trendUp, color = "blue" }) {
  const Icon = IconComponent;
  const colors = {
    blue: "from-blue-500 to-blue-600 shadow-blue-500/25",
    green: "from-emerald-500 to-emerald-600 shadow-emerald-500/25",
    red: "from-red-500 to-red-600 shadow-red-500/25",
    orange: "from-orange-500 to-orange-600 shadow-orange-500/25",
    purple: "from-purple-500 to-purple-600 shadow-purple-500/25",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden border-0 shadow-lg shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{title}</p>
              <p className="mt-2 text-3xl font-bold text-slate-800">{value}</p>
              {subtitle && (
                <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
              )}
              {trend && (
                <div className={cn(
                  "mt-2 inline-flex items-center gap-1 text-sm font-medium",
                  trendUp ? "text-emerald-600" : "text-red-600"
                )}>
                  <span>{trend}</span>
                </div>
              )}
            </div>
            <div className={cn(
              "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
              colors[color]
            )}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className={cn(
          "absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r",
          colors[color].split(" ")[0],
          colors[color].split(" ")[1]
        )} />
      </Card>
    </motion.div>
  );
}