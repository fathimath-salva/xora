import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Package, Clock, ChevronDown, ChevronUp } from 'lucide-react';

const PolicySection = ({ title, icon: Icon, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-xora-taupe/30 bg-xora-offwhite">
      <button
        type="button"
        className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 hover:bg-xora-sand/30 transition-colors"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-4 h-4 text-xora-taupe-dark flex-shrink-0" />}
          <span className="font-serif text-lg text-xora-charcoal">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-xora-taupe-dark flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-xora-taupe-dark flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-6 pb-6 text-sm leading-7 text-xora-charcoal space-y-3 border-t border-xora-taupe/20 pt-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default function StorePolicies() {
  return (
    <main className="min-h-[60vh] bg-xora-cream py-12 sm:py-16">
      <article className="mx-auto max-w-3xl px-4 sm:px-6">

        {/* Header */}
        <p className="text-xs uppercase tracking-luxury text-xora-taupe-dark">Customer Care</p>
        <h1 className="mt-2 font-serif text-4xl sm:text-5xl text-xora-charcoal font-light">Store Policies</h1>
        <p className="mt-3 text-sm text-xora-taupe-dark leading-relaxed">
          This working policy draft describes a proposed 14-day request window. It is pending client approval and should not be treated as final commercial or legal terms.
        </p>

        {/* Draft Notice */}
        <div className="mt-6 flex gap-3 border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Draft for client approval.</strong>
            {' '}Final terms for changed-mind returns, item condition, original packaging requirements, return shipping charges, exchange eligibility for unavailable sizes, refund processing timelines, and any exceptions have not been confirmed by the client. The delivery threshold and estimated tax in checkout also require final client approval. This page is a working draft and must be reviewed before it is presented to customers as a binding policy.
          </div>
        </div>

        {/* Quick Summary */}
        <div className="mt-8 grid grid-cols-3 gap-3 text-center text-xs">
          <div className="bg-xora-offwhite border border-xora-taupe/30 p-4 space-y-1">
            <Clock className="w-5 h-5 mx-auto text-xora-taupe-dark" />
            <p className="font-semibold text-xora-charcoal">14-Day Window</p>
            <p className="text-xora-taupe-dark">Request period from delivery date</p>
          </div>
          <div className="bg-xora-offwhite border border-xora-taupe/30 p-4 space-y-1">
            <RefreshCw className="w-5 h-5 mx-auto text-xora-taupe-dark" />
            <p className="font-semibold text-xora-charcoal">Exchanges</p>
            <p className="text-xora-taupe-dark">Subject to stock availability</p>
          </div>
          <div className="bg-xora-offwhite border border-xora-taupe/30 p-4 space-y-1">
            <Package className="w-5 h-5 mx-auto text-xora-taupe-dark" />
            <p className="font-semibold text-xora-charcoal">Faulty Items</p>
            <p className="text-xora-taupe-dark">Reviewed case by case</p>
          </div>
        </div>

        {/* Policy Sections */}
        <div className="mt-10 space-y-2">

          {/* Main Policy Statement */}
          <section className="bg-xora-offwhite border border-xora-taupe/30 px-6 py-6 text-sm leading-7 text-xora-charcoal space-y-3">
            <h2 className="font-serif text-2xl text-xora-charcoal">Exchanges, Returns &amp; Refunds</h2>
            <p>
              <strong>Draft proposal:</strong> contact XORA customer care within 14 calendar days of delivery to request an exchange, return, or refund review. The proposed window begins on the confirmed delivery date. Whether all request types are accepted and whether requests after day 14 are ineligible require client approval.
            </p>
            <p>
              Proposed process: contact customer care before sending an item back and wait for return instructions. The review steps and approval authority are pending client approval.
            </p>
            <p>
              To start a request, please use the contact details on the{' '}
              <Link to="/contact" className="underline underline-offset-2 hover:text-xora-taupe-dark">Contact page</Link>
              {' '}and include your order number, the item(s) concerned, and the reason for your request.
            </p>
          </section>

          {/* Scenario 1: Faulty or Damaged */}
          <PolicySection title="Faulty, Damaged, or Incorrect Items" icon={AlertTriangle} defaultOpen>
            <p>
              If an item arrives faulty, damaged, or incorrect, contact XORA customer care promptly so the issue can be reviewed. Any specific reporting deadline is pending client approval.
            </p>
            <p>
              Please include:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xora-taupe-dark">
              <li>Your order number</li>
              <li>Clear photographs showing the fault or damage</li>
              <li>A brief description of the issue</li>
            </ul>
            <p>
              The customer care team will review your request. Verified faulty or incorrect items are prioritised. Collection, replacement, and refund arrangements are subject to client-confirmed terms and stock availability at the time of review.
            </p>
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 p-3">
              <strong>Draft note:</strong> The process for covering return shipping costs for faulty items requires client confirmation before being communicated to customers.
            </p>
          </PolicySection>

          {/* Scenario 2: Changed Mind */}
          <PolicySection title="Changed Mind or No Longer Required" icon={RefreshCw}>
            <p>
              A return or refund request for a change of mind may be submitted within 14 days of delivery. Eligibility, required item condition, original packaging, and whether any return shipping charges apply are subject to the final client-approved policy terms, which have not yet been confirmed.
            </p>
            <p>
              Until the final terms are approved, XORA customer care will handle all change-of-mind requests individually and communicate the applicable process at the time of the request.
            </p>
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 p-3">
              <strong>Draft note:</strong> The client must confirm whether change-of-mind returns are accepted, the required item condition (e.g., unworn, tags attached), original packaging requirements, and whether return postage is at the customer's expense.
            </p>
          </PolicySection>

          {/* Scenario 3: Wrong Size */}
          <PolicySection title="Wrong Size Ordered or Poor Fit" icon={Package}>
            <p>
              If an item does not fit as expected, you may contact XORA customer care within 14 days of delivery to request an exchange for a different size. Exchanges are subject to stock availability at the time of the request.
            </p>
            <p>
              If the requested size is not available, the customer care team will explain the available options — which may include a refund, a credit, or being placed on a waiting list. An exchange is not confirmed until the request has been reviewed and the replacement size is confirmed as available.
            </p>
            <p>
              XORA provides a Size Guide on each product page to help customers select the correct size before purchasing. Please consult the guide and, if in doubt, contact the customer care team before placing your order.
            </p>
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 p-3">
              <strong>Draft note:</strong> Whether size exchanges are free of charge, what happens if no size is available (full refund vs store credit), and any restocking fee require client confirmation.
            </p>
          </PolicySection>

          {/* Refund Processing */}
          <PolicySection title="Refund Processing" icon={Clock}>
            <p>
              Refund eligibility, method, inspection requirements, and processing timeline are pending client approval. This draft does not promise that a refund will be approved or set a payment date.
            </p>
            <p>
              If a refund is approved, the client must confirm how it will be handled, including whether it returns to the original payment method. Any inspection and refund procedure remains subject to approval.
            </p>
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 p-3">
              <strong>Draft note:</strong> The client must confirm the refund processing timeline (e.g., 5–10 business days), whether refunds are issued to the original payment method only, and any partial refund or deduction policies.
            </p>
          </PolicySection>

        </div>

        {/* Contact CTA */}
        <div className="mt-12 bg-xora-charcoal text-xora-cream p-8 text-center">
          <h3 className="font-serif text-2xl font-light tracking-wide">Questions about an Order?</h3>
          <p className="text-xs text-xora-cream/70 mt-2 mb-5">
            Our customer care team is here to help. Include your order number in any message.
          </p>
          <Link to="/contact" className="inline-flex btn-luxury bg-xora-cream text-xora-charcoal hover:bg-xora-sand">
            Contact Customer Care
          </Link>
        </div>

      </article>
    </main>
  );
}
