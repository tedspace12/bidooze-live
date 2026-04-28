'use client'
import { AppSidebar } from "@/components/app-sidebar"
import HeaderBreadcrumbs from "@/components/header-breadcrumbs"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { cn } from '@/lib/utils'
import { AuctioneerApprovedGuard } from "@/components/guards/AuctioneerApprovedGuard"
import { NavigationProvider } from "@/context/nav-context"
import { SubscriptionBanner } from "@/components/subscription/SubscriptionBanner"
import { SubscriptionRequiredModal } from "@/components/subscription/SubscriptionRequiredModal"

export default function BidoozeSellerLayout({ children }: { children: React.ReactNode }) {

    return (
        <NavigationProvider>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset className="min-w-0">
                    <HeaderBreadcrumbs />
                    <div className="min-h-screen min-w-0 bg-background">
                        <main className={cn(
                            "min-w-0 transition-all duration-300"
                        )}>
                            <div className='min-w-0 p-3 pt-0 sm:p-4 sm:pt-0 md:p-6 md:pt-0'>
                                <SubscriptionBanner />
                                <AuctioneerApprovedGuard>{children}</AuctioneerApprovedGuard>
                                <SubscriptionRequiredModal />
                            </div>
                        </main>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </NavigationProvider>
    )
}
