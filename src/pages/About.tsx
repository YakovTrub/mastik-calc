import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, BookOpen, Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Calculator
          </Button>
        </Link>

        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">About MASTIK</h1>
            <p className="text-xl text-muted-foreground">
              Israeli Net Salary Calculator - 2025 Tax Rules
            </p>
          </div>

          <Card className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <Calculator className="h-6 w-6 text-primary mt-1" />
              <div>
                <h2 className="text-2xl font-semibold mb-2">What is MASTIK?</h2>
                <p className="text-muted-foreground leading-relaxed">
                  MASTIK is a comprehensive, modular salary calculator designed to help Israeli employees 
                  understand their net take-home pay. The system provides transparent breakdowns of taxes, 
                  social deductions, and tax credits based on official Israeli tax authority rules for 2025.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Accurate Tax Calculation:</strong> Progressive tax brackets with proper credit point application</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Social Security:</strong> Bituach Leumi and health insurance calculations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Pension Contributions:</strong> Employee and employer pension and severance tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Credit Points (נקודות זיכוי):</strong> Comprehensive credit system including family, education, and service credits</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Locality Discounts:</strong> Support for eligible settlements with tax benefits</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Modular Architecture:</strong> JSON-driven configuration for easy updates when tax laws change</span>
              </li>
            </ul>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <BookOpen className="h-6 w-6 text-primary mt-1" />
              <div>
                <h2 className="text-2xl font-semibold mb-2">Data Sources</h2>
                <p className="text-muted-foreground mb-4">
                  All calculations are based on official Israeli tax authority regulations and publicly available information:
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <a 
                href="https://www.kolzchut.org.il/en/Credit_Points" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Kol Zchut - Credit Points Guide
              </a>
              <a 
                href="https://www.kolzchut.org.il/en/Income_Tax_in_Israel" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Kol Zchut - Income Tax Information
              </a>
              <a 
                href="https://www.btl.gov.il/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                National Insurance Institute (Bituach Leumi)
              </a>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">2025 Tax Rules Summary</h2>
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-semibold mb-2">Income Tax Brackets (Monthly)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-2">Income Range (₪)</th>
                        <th className="text-right p-2">Tax Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr><td className="p-2">0 - 7,010</td><td className="text-right p-2">10%</td></tr>
                      <tr><td className="p-2">7,011 - 10,060</td><td className="text-right p-2">14%</td></tr>
                      <tr><td className="p-2">10,061 - 16,150</td><td className="text-right p-2">20%</td></tr>
                      <tr><td className="p-2">16,151 - 22,440</td><td className="text-right p-2">31%</td></tr>
                      <tr><td className="p-2">22,441 - 46,690</td><td className="text-right p-2">35%</td></tr>
                      <tr><td className="p-2">46,691 - 60,130</td><td className="text-right p-2">47%</td></tr>
                      <tr><td className="p-2">60,131+</td><td className="text-right p-2">50%</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Credit Points</h3>
                <p className="text-muted-foreground">
                  Each credit point is worth approximately ₪242/month (₪2,904/year). Credits reduce your final tax liability.
                  Base resident credit: 2.25 points for all Israeli residents.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Social Security</h3>
                <p className="text-muted-foreground">
                  Bituach Leumi contributions: 4.27% up to ₪7,522, then 12.17% up to ₪50,695.
                  These contributions reduce your taxable income base.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-muted/50">
            <h2 className="text-xl font-semibold mb-2">Disclaimer</h2>
            <p className="text-sm text-muted-foreground">
              This calculator provides estimates based on 2025 tax rules and should be used for informational purposes only. 
              For official tax calculations and personalized advice, please consult with a certified accountant or the Israeli Tax Authority.
              Tax regulations may change, and individual circumstances may affect final calculations.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
