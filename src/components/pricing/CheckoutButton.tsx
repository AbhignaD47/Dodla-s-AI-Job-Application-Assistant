"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CheckoutButtonProps {
    planId: string;
    price: number;
}

export function CheckoutButton({ planId, price }: CheckoutButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleCheckout = async () => {
        setIsLoading(true);

        try {
            // Find the promo code input in the DOM (hacky for demo, better to use state lift or context)
            const promoInput = document.querySelector('input[placeholder="Promo code"]') as HTMLInputElement;
            const promoCode = promoInput?.value || "";

            // 1. Call your custom checkout API
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId, promoCode }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to initialize checkout.");
            }

            // 2. Handle 100% discount full bypass
            if (data.isFree) {
                toast.success("Promo code applied successfully! Subscription activated for 0 INR.");
                // Redirect to dashboard
                window.location.href = "/dashboard";
                return;
            }

            // 3. Razorpay integration logic (requires razorpay script loaded on page)
            // Since we don't have the script tag injected globally right now, this will mock success
            toast.success("Redirecting to Razorpay checkout...");

            // Real Implementation Note:
            // const options = {
            //   key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            //   amount: data.order.amount,
            //   currency: "INR",
            //   name: "Dodla's AI Assistant",
            //   description: `${planId} Subscription`,
            //   order_id: data.order.id,
            //   handler: function (response: any) {
            //     // Real code would verify payment via another API call or let the webhook handle it
            //     toast.success("Payment successful!");
            //     window.location.href = "/dashboard";
            //   },
            // };
            // const rzp = new (window as any).Razorpay(options);
            // rzp.open();

        } catch (err: any) {
            toast.error(err.message || "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            className="w-full"
            size="lg"
            onClick={handleCheckout}
            disabled={isLoading}
        >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Subscribe Now"}
        </Button>
    );
}
