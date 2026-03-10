import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
    title: "Pricing - Dodla's AI Job Assistant",
    description: "Simple, transparent pricing for your job search.",
};

const plans = [
    {
        name: "Free Forever",
        price: 0,
        credits: "Unlimited",
        interval: "lifetime",
        popular: true,
        features: [
            "Lifetime validity",
            "Unlimited AI Credits",
            "Full AI Resume Parsing",
            "Unlimited Job Matches",
            "Unlimited AI Cover Letters",
            "Priority Processing",
        ],
    }
];

export default async function PricingPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <div className="container py-24 mx-auto max-w-6xl">
            <div className="text-center space-y-4 mb-16">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                    100% Free Forever
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    We believe everyone deserves the best tools to land their dream job. No subscriptions, no hidden fees.
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
                            <Link href="/dashboard" className="mt-auto block w-full">
                                <Button className="w-full" variant="default">
                                    Go to Dashboard
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/signup" className="mt-auto block">
                                <Button className="w-full" variant="default">
                                    Create Free Account
                                </Button>
                            </Link>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
