import { useState } from "react";
import { 
  Search,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function Support() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    {
      id: 1,
      question: "How do I track my order?",
      answer: "You can track your order by visiting the 'Order History' section in your account dashboard. Click on any order to view detailed tracking information including tracking number and estimated delivery date."
    },
    {
      id: 2,
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for all gaming gear. Items must be in original condition with all accessories included. Gaming peripherals can be returned within 30 days of purchase for a full refund."
    },
    {
      id: 3,
      question: "Do you offer warranty on gaming products?",
      answer: "Yes! All our gaming products come with manufacturer warranty. Additionally, we provide extended warranty options for premium gaming gear. Warranty periods vary by product category."
    },
    {
      id: 4,
      question: "How long does shipping take?",
      answer: "Standard shipping takes 3-5 business days. Express shipping is available for 1-2 day delivery. Free shipping is available on orders over $100. Same-day delivery is available in select metropolitan areas."
    },
    {
      id: 5,
      question: "Can I cancel or modify my order?",
      answer: "Orders can be cancelled or modified within 1 hour of placement. After processing begins, changes may not be possible. Contact our support team immediately if you need to make changes."
    },
    {
      id: 6,
      question: "Do you price match other retailers?",
      answer: "Yes, we offer price matching for identical products from authorized retailers. The price match must be for an in-stock item and we reserve the right to verify pricing with the competitor."
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/20">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Gaming Support Center
        </h1>
        <p className="text-gray-300 text-sm sm:text-base">
          Get help with your gaming gear and account
        </p>
      </div>

      {/* FAQ Section - Now full width */}
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Frequently Asked Questions</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredFaqs.map((faq) => (
              <div key={faq.id} className="border border-gray-700/50 rounded-lg">
                <button
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-700/30 transition-colors"
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                >
                  <span className="text-white font-medium text-sm sm:text-base">{faq.question}</span>
                  {expandedFaq === faq.id ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {expandedFaq === faq.id && (
                  <div className="px-4 pb-4">
                    <p className="text-gray-300 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
            
            {filteredFaqs.length === 0 && searchTerm && (
              <div className="text-center py-8">
                <p className="text-gray-400">No FAQs found matching your search.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
