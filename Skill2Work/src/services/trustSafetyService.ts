import type { Job, User, TrustAssessment, RiskSignal } from '../types';

class TrustSafetyService {
  /**
   * Analyzes job posting and recruiter metadata for Trust & Safety risk signals
   */
  public evaluateJobTrust(
    job: Job,
    recruiter?: User | null,
    allJobs: Job[] = [],
    jobReportsCount: number = 0
  ): TrustAssessment {
    const riskSignals: RiskSignal[] = [];
    const textToCheck = `${job.title} ${job.description} ${job.landmark_area || ''}`.toLowerCase();

    // 1. Unrealistic Payment Analysis
    this.checkUnrealisticPayment(job, riskSignals);

    // 2. Suspicious Description & Scheme Analysis
    this.checkSuspiciousDescription(job, textToCheck, riskSignals);

    // 3. External Payment & Advance Fee Detection
    this.checkExternalPaymentRequests(textToCheck, riskSignals);

    // 4. Sensitive Personal Information / Credential Requests
    this.checkSensitiveInfoRequests(textToCheck, riskSignals);

    // 5. Repeated / Duplicate Content Analysis
    this.checkDuplicateContent(job, allJobs, riskSignals);

    // 6. Recruiter Behavior & History Depth
    const { hasSufficientRecruiterHistory, recruiterHistoryNote } = this.checkRecruiterBehavior(
      recruiter, 
      riskSignals,
      jobReportsCount
    );

    // 7. Calculate Risk Score & Status
    let riskScore = 0;
    for (const signal of riskSignals) {
      if (signal.severity === 'high') riskScore += 40;
      else if (signal.severity === 'medium') riskScore += 20;
      else riskScore += 10;
    }

    // Trust adjustments for established verified recruiters
    if (recruiter && (recruiter.rating || 0) >= 4.2 && (recruiter.experience || 0) >= 1) {
      riskScore = Math.max(0, riskScore - 15);
    }

    riskScore = Math.min(100, Math.max(0, riskScore));

    // Determine status (strictly non-accusatory)
    let status: TrustAssessment['status'];
    let headline: string;
    let recommendedAction: string;

    const hasHighRisk = riskSignals.some(s => s.severity === 'high');

    if (hasHighRisk || riskScore >= 35) {
      status = 'potential_risk_detected';
      headline = 'Potential Risk Detected';
      recommendedAction = 'Verify job scope directly with the recruiter in person. Never transfer money, deposits, or share OTPs before commencing work.';
    } else if (riskScore > 0 || !hasSufficientRecruiterHistory) {
      if (!hasSufficientRecruiterHistory) {
        status = 'insufficient_data';
        headline = 'New Recruiter (Standard Verification)';
        recommendedAction = 'Recruiter account is recently registered. Standard verification checks passed; confirm gig details upon arrival.';
      } else {
        status = 'low_risk';
        headline = 'Standard Community Gig';
        recommendedAction = 'No significant risk signals detected. Standard platform safety guidelines apply.';
      }
    } else {
      status = 'verified';
      headline = 'Verified Recruiter Post';
      recommendedAction = 'Verified recruiter with clean history and established track record.';
    }

    // Generate clear, explainable reasoning
    const explanation = this.generateExplanation(status, riskSignals, hasSufficientRecruiterHistory, recruiterHistoryNote);

    return {
      status,
      riskScore,
      riskSignals,
      headline,
      explanation,
      hasSufficientRecruiterHistory,
      recruiterHistoryNote,
      recommendedAction
    };
  }

  /**
   * Detects unrealistic payout amounts (e.g. ₹50,000/hr for informal tasks or $< ₹50/hr)
   */
  private checkUnrealisticPayment(job: Job, signals: RiskSignal[]) {
    const amount = job.payout_amount;
    const unit = job.payout_unit || 'hour';

    if (!amount || isNaN(amount)) return;

    // Extreme hourly pay check
    if (unit === 'hour') {
      if (amount >= 2500) {
        signals.push({
          type: 'unrealistic_payment',
          severity: 'high',
          label: 'Unusually High Hourly Pay',
          description: `The offered rate of ₹${amount.toLocaleString('en-IN')}/hour is far above local market benchmarks (typically ₹150–₹600/hr) for informal gigs.`,
          evidence: `₹${amount}/hour`
        });
      } else if (amount < 60 && amount > 0) {
        signals.push({
          type: 'unrealistic_payment',
          severity: 'medium',
          label: 'Below Minimum Wage Baseline',
          description: `The offered pay of ₹${amount}/hour is significantly below regional informal labor standards.`,
          evidence: `₹${amount}/hour`
        });
      }
    } else if (unit === 'task') {
      if (amount >= 20000) {
        signals.push({
          type: 'unrealistic_payment',
          severity: 'high',
          label: 'Abnormally High Task Payout',
          description: `A single task payout of ₹${amount.toLocaleString('en-IN')} is unusually high for local community gigs without prior verification.`,
          evidence: `₹${amount}/task`
        });
      }
    } else if (unit === 'day') {
      if (amount >= 15000) {
        signals.push({
          type: 'unrealistic_payment',
          severity: 'high',
          label: 'Unusually High Daily Rate',
          description: `Daily rate of ₹${amount.toLocaleString('en-IN')}/day exceeds realistic industry averages for standard short-term shifts.`,
          evidence: `₹${amount}/day`
        });
      }
    }
  }

  /**
   * Detects suspicious get-rich-quick schemes, deceptive promises, or vague descriptions
   */
  private checkSuspiciousDescription(job: Job, text: string, signals: RiskSignal[]) {
    // 1. Get-rich-quick claims
    const getRichRegex = /(?:earn|income|salary)\s*(?:up to\s*)?(?:₹|rs\.?|inr)?\s*\d+\s*(?:lakh|crore|thousand|\d{4,6})\s*(?:daily|per day|per hour|weekly)/i;
    if (getRichRegex.test(text)) {
      signals.push({
        type: 'suspicious_description',
        severity: 'high',
        label: 'Unrealistic Earnings Claim',
        description: 'Description promises extraordinarily high returns or daily earnings that are typical of deceptive employment schemes.',
        evidence: text.match(getRichRegex)?.[0]
      });
      return;
    }

    // 2. "No work only investment" or "double money"
    const scamRegex = /(?:no work|zero work|just invest|double your money|guaranteed returns|instant profit|work 1 hour earn 10000)/i;
    if (scamRegex.test(text)) {
      signals.push({
        type: 'suspicious_description',
        severity: 'high',
        label: 'Deceptive Scheme Phrasing',
        description: 'Mentions zero-work or investment-linked returns inconsistent with actual informal labor gigs.',
        evidence: text.match(scamRegex)?.[0]
      });
      return;
    }

    // 3. Very brief / vague description with high pay
    if (job.description && job.description.trim().length < 15 && job.payout_amount > 1000) {
      signals.push({
        type: 'suspicious_description',
        severity: 'low',
        label: 'Vague Job Description',
        description: 'Job description has minimal detail regarding exact duties despite above-average pay.',
        evidence: job.description
      });
    }
  }

  /**
   * Detects requests for external deposits, registration fees, or advance payments
   */
  private checkExternalPaymentRequests(text: string, signals: RiskSignal[]) {
    // 1. Advance fees or deposits
    const advanceFeeRegex = /(?:registration|joining|training|id card|uniform|kit|security|deposit)\s*(?:fee|charge|deposit|cost|money|amount|pay|₹|rs)/i;
    const feeMatch = text.match(advanceFeeRegex);
    if (feeMatch) {
      signals.push({
        type: 'external_payment_request',
        severity: 'high',
        label: 'Request for Advance Fee / Deposit',
        description: 'Post asks the worker to pay an upfront fee (registration, kit, uniform, or security deposit). Legitimate recruiters on Talent2Task never charge job seekers.',
        evidence: feeMatch[0]
      });
      return;
    }

    // 2. Off-platform payment or crypto redirection
    const offPlatformRegex = /(?:pay to (?:upi|gpay|phonepe|paytm)|deposit money|transfer advance|telegram id|crypto|usdt|binance)/i;
    const offPlatformMatch = text.match(offPlatformRegex);
    if (offPlatformMatch) {
      signals.push({
        type: 'external_payment_request',
        severity: 'high',
        label: 'Off-Platform Payment Redirection',
        description: 'Mentions transferring money or contacting anonymous external channels (Telegram, crypto, direct UPI) before work begins.',
        evidence: offPlatformMatch[0]
      });
    }
  }

  /**
   * Detects requests for confidential personal credentials, banking details, or OTPs
   */
  private checkSensitiveInfoRequests(text: string, signals: RiskSignal[]) {
    // 1. OTP or PIN demands
    const otpRegex = /(?:aadhaar|aadhar|bank|card|login)\s*(?:otp|pin|password|credential)/i;
    const otpMatch = text.match(otpRegex);
    if (otpMatch) {
      signals.push({
        type: 'sensitive_info_request',
        severity: 'high',
        label: 'Request for Sensitive OTP / PIN',
        description: 'Asks workers to share one-time passwords (OTP), banking PINs, or confidential security credentials.',
        evidence: otpMatch[0]
      });
      return;
    }

    // 2. Banking / Card details upfront
    const bankRegex = /(?:debit card|credit card|cvv|bank account password|net banking)/i;
    const bankMatch = text.match(bankRegex);
    if (bankMatch) {
      signals.push({
        type: 'sensitive_info_request',
        severity: 'high',
        label: 'Financial Credential Request',
        description: 'Requests debit/credit card security numbers or net banking logins.',
        evidence: bankMatch[0]
      });
    }
  }

  /**
   * Detects duplicate or rapid repeated postings by the same recruiter
   */
  private checkDuplicateContent(job: Job, allJobs: Job[], signals: RiskSignal[]) {
    if (!allJobs || allJobs.length <= 1) return;

    const currentTitle = job.title.trim().toLowerCase();
    const currentDesc = (job.description || '').trim().toLowerCase();

    // Look for other jobs by the same recruiter with matching title and description
    const duplicates = allJobs.filter(other => {
      if (other.id === job.id) return false;
      if (other.recruiter_id !== job.recruiter_id) return false;

      const otherTitle = other.title.trim().toLowerCase();
      const otherDesc = (other.description || '').trim().toLowerCase();

      return (
        (otherTitle === currentTitle && currentTitle.length > 5) ||
        (otherDesc.length > 20 && otherDesc === currentDesc)
      );
    });

    if (duplicates.length >= 2) {
      signals.push({
        type: 'duplicate_content',
        severity: 'medium',
        label: 'Repeated / Duplicate Posting',
        description: `This recruiter has posted near-identical job descriptions ${duplicates.length} times in a short window.`,
        evidence: `${duplicates.length} duplicate postings found`
      });
    }
  }

  /**
   * Evaluates recruiter's account tenure, review ratings, and past reports
   */
  private checkRecruiterBehavior(
    recruiter: User | null | undefined,
    signals: RiskSignal[],
    jobReportsCount: number = 0
  ): { hasSufficientRecruiterHistory: boolean; recruiterHistoryNote: string } {
    // 1. Community reports filed against this specific job
    if (jobReportsCount >= 2) {
      signals.push({
        type: 'suspicious_recruiter_behavior',
        severity: 'medium',
        label: 'Prior Community Reports',
        description: `${jobReportsCount} community member(s) have flagged this posting for safety review.`,
        evidence: `${jobReportsCount} reports`
      });
    }

    if (!recruiter) {
      return {
        hasSufficientRecruiterHistory: false,
        recruiterHistoryNote: 'Recruiter account details are not yet fully indexed. Standard algorithmic screening applied.'
      };
    }

    // Check account depth
    const reviewCount = recruiter.review_count !== undefined 
      ? recruiter.review_count 
      : ((recruiter.rating || 0) >= 4.0 && (recruiter.experience || 0) >= 1 ? 5 : 0);
    const rating = recruiter.rating || 0;

    if (reviewCount >= 3 && rating >= 4.0) {
      return {
        hasSufficientRecruiterHistory: true,
        recruiterHistoryNote: `Established recruiter with ${reviewCount} verified reviews and a ${rating.toFixed(1)}/5 community rating.`
      };
    }

    // If new user with no reviews or completed gigs
    return {
      hasSufficientRecruiterHistory: false,
      recruiterHistoryNote: 'New recruiter account with no prior job completion history. Standard algorithmic verification applied.'
    };
  }

  /**
   * Builds an objective, non-accusatory summary explanation of findings
   */
  private generateExplanation(
    status: TrustAssessment['status'],
    signals: RiskSignal[],
    _hasSufficientData: boolean,
    historyNote: string
  ): string {
    if (status === 'potential_risk_detected') {
      const signalTitles = signals.map(s => s.label).join(', ');
      return `Potential risk signals were detected in this posting (${signalTitles}). Talent2Task does not claim this posting is fraudulent, but recommends verifying all requirements before sharing personal information or accepting terms.`;
    }

    if (status === 'insufficient_data') {
      return `Standard content verification checks completed with no critical flags. Note: ${historyNote}. Please exercise standard workplace prudence.`;
    }

    if (status === 'verified') {
      return `This posting has passed all Trust & Safety checks. ${historyNote}.`;
    }

    return `Standard verification completed. No suspicious patterns or irregular payment requests detected in this posting.`;
  }
}

export const trustSafetyService = new TrustSafetyService();
