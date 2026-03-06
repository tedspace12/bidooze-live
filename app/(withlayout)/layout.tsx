'use client'
import { AppSidebar } from "@/components/app-sidebar"
import HeaderBreadcrumbs from "@/components/header-breadcrumbs"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { cn } from '@/lib/utils'
import { AuctioneerApprovedGuard } from "@/components/guards/AuctioneerApprovedGuard"

export default function BidoozeSellerLayout({ children }: { children: React.ReactNode }) {

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <HeaderBreadcrumbs />
                <div className="min-h-screen bg-background">
                    <main className={cn(
                        "transition-all duration-300"
                    )}>
                        <div className='pt-0 p-3 sm:p-4 md:p-6'>
                            <AuctioneerApprovedGuard>{children}</AuctioneerApprovedGuard>
                        </div>
                    </main>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
