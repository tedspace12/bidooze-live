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
import { RegistrationCompletionReminder } from "@/components/auctioneer/RegistrationCompletionReminder"
import { AuthStoreProvider } from "@/features/auth/store/authStore"

// Auctioneer-only shell. Now that /admin/* has its own physically separate
// route group (app/(admin)/layout.tsx), this tree is guaranteed to only
// ever render for the auctioneer panel — AuthStoreProvider is pinned to
// "auctioneer" so it never reads/writes the admin session, and an admin
// session (if active elsewhere) can never bleed into or get clobbered by
// this one.
export default function BidoozeSellerLayout({ children }: { children: React.ReactNode }) {

    return (
        <AuthStoreProvider panel="auctioneer">
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
                                    <RegistrationCompletionReminder />
                                </div>
                            </main>
                        </div>
                    </SidebarInset>
                </SidebarProvider>
            </NavigationProvider>
        </AuthStoreProvider>
    )
}
