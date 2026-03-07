import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";
import { PromoCodeInput } from "@/components/pricing/PromoCodeInput";
import { CheckoutButton } from "@/components/pricing/CheckoutButton";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
    title: "Pricing - Dodla's AI Job Assistant",
    description: "Simple, transparent pricing for your job search.",
};

const plans = [
    {
        name: "Weekly Plan",
        price: 599,
        credits: "5,000",
        interval: "7 days",
        features: [
            "7 days validity",
            "50% unused credits carry forward one cycle",
            "Full AI Resume Parsing",
            "Job Matching System",
            "AI Cover Letter Generation",
        ],
    },
    {
        name: "Monthly Plan",
        price: 2499,
        credits: "25,000",
        interval: "30 days",
        popular: true,
        features: [
            "30 days validity",
            "50% unused credits carry forward one cycle",
            "Everything in Weekly Plan",
            "Priority Job Matches",
        ],
    },
    {
        name: "Yearly Plan",
        price: 26999,
        credits: "300,000",
        interval: "365 days",
        features: [
            "365 days validity",
            "50% unused credits carry forward one cycle",
            "Everything in Monthly Plan",
            "Unlimited Job Matches",
        ],
    },
];

export default async function PricingPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <div className="container py-24 mx-auto max-w-6xl">
            <div className="text-center space-y-4 mb-16">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                    Simple, transparent pricing
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Choose the plan that best fits your job search needs. Cancel anytime.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {plans.map((plan) => (
                    <div
                        key={plan.name}
                        className={`glass-card relative flex flex-col p-8 rounded-2xl ${plan.popular ? "border-brand border-2 shadow-lg scale-105" : "border"
                            }`}
                    >
                        {plan.popular && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <span className="bg-brand text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                    Most Popular
                                </span>
                            </div>
                        )}

                        <div className="mb-6">
                            <h3 className="text-2xl font-bold">{plan.name}</h3>
                            <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                                ₹{plan.price.toLocaleString('en-IN')}
                                <span className="ml-1 text-xl font-medium text-muted-foreground">
                                    /{plan.interval}
                                </span>
                            </div>
                            <p className="mt-2 text-muted-foreground">{plan.credits} AI Credits</p>
                        </div>

                        <ul className="flex-1 space-y-4 mb-8">
                            {plan.features.map((feature) => (
                                <li key={feature} className="flex items-start">
                                    <Check className="h-5 w-5 text-brand shrink-0 mr-2" />
                                    <span className="text-slate-700">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        {user ? (
                            <div className="space-y-4 mt-auto">
                                <PromoCodeInput planId={plan.name.toLowerCase()} price={plan.price} />
                                <CheckoutButton planId={plan.name.toLowerCase()} price={plan.price} />
                            </div>
                        ) : (
                            <Link href="/login" className="mt-auto block">
                                <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                                    Sign In to Subscribe
                                </Button>
                            </Link>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
