"use client"
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

export function AdminHeader() {
  const [search, setSearch] = useState("")
  const isMobile = useIsMobile()

  return (
    <div className={cn("flex items-center px-6 py-5 border-b border-gray-300 bg-white", {
      'justify-end': isMobile,
      'justify-between': !isMobile,
    })}>
      {!isMobile && (
        <div className="relative w-1/4">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <Input
            placeholder="Rechercher..."
            className="pl-9 border-none bg-gray-200 text-gray-700 placeholder-gray-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 border-l border-gray-300 pl-4">
          <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center">RG</div>
          <div className="text-left">
            <p className="text-sm font-medium">Romain Gilot</p>
            <p className="text-xs text-gray-500">Administrateur</p>
          </div>
        </div>
      </div>
    </div>
  )
}