'use client'
import { AppSidebar } from "@/components/app-sidebar"
import HeaderBreadcrumbs from "@/components/header-breadcrumbs"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { cn } from '@/lib/utils'
import { NavigationProvider } from "@/context/nav-context"
import { AuthStoreProvider } from "@/features/auth/store/authStore"

// Admin-only shell. This route group is physically separate from the
// auctioneer dashboard shell (app/(withlayout)/layout.tsx) — nothing
// auctioneer-specific (AuctioneerApprovedGuard, SubscriptionBanner,
// SubscriptionRequiredModal, RegistrationCompletionReminder) is mounted
// here, so it can never fire a background request or redirect for a panel
// this tree isn't part of. AuthStoreProvider is pinned to "admin" — this
// subtree never reads or writes the auctioneer session/token, and an
// auctioneer session (if one exists in another tab or was active before
// navigating here) can never bleed into or be clobbered by this one.
export default function BidoozeAdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthStoreProvider panel="admin">
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
                                    {children}
                                </div>
                            </main>
                        </div>
                    </SidebarInset>
                </SidebarProvider>
            </NavigationProvider>
        </AuthStoreProvider>
    )
}
