"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PaymentCancelPage() {
  const router = useRouter();

  return (
    <>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 mb-4">
            <AlertTriangle className="h-10 w-10 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Payment Cancelled</h1>
          <p className="text-lg text-muted-foreground">
            Your payment was cancelled or failed
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What happened?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Your booking is still on hold. You can try again to complete the payment
                before the hold expires.
              </AlertDescription>
            </Alert>

            <div className="space-y-2 text-sm">
              <p className="font-semibold">Common reasons for payment failure:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Insufficient funds in your account</li>
                <li>Incorrect card details</li>
                <li>Card declined by your bank</li>
                <li>Payment cancelled by user</li>
                <li>Network connectivity issues</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold mb-2">What you can do:</h4>
              <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                <li>Check your card details and try again</li>
                <li>Contact your bank if the card was declined</li>
                <li>Try a different payment method</li>
                <li>Choose to pay at the hotel instead</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="flex-1"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Link href="/rooms" className="flex-1">
            <Button variant="outline" className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Browse Rooms
            </Button>
          </Link>
        </div>
      </div>
      </div>
    </>
  );
}
