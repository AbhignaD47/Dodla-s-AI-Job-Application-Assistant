"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Ticket } from "lucide-react";

export function PromoCodeInput({ planId, price }: { planId: string, price: number }) {
    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const applyPromo = async () => {
        if (!code) return;
        setIsLoading(true);

        // Simulating promo check - in reality, we check this during the actual checkout API call
        // For UI demonstration, we just show a generic message.
        toast.success("Promo code added to cart. Will be applied at checkout!");
        setIsLoading(false);
    };

    return (
        <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
                type="text"
                placeholder="Promo code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="uppercase"
            />
            <Button
                type="button"
                variant="secondary"
                onClick={applyPromo}
                disabled={isLoading || !code}
            >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ticket className="h-4 w-4" />}
            </Button>
        </div>
    );
}
