import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function ChartCard({ title, subtitle, children, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white/80 backdrop-blur-sm h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-slate-800">{title}</CardTitle>
              {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
            </div>
            {action}
          </div>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
}