import { AIService } from '../ai';

export type DocumentType = 'business' | 'legal' | 'financial' | 'spiritual' | 'general';

export class HakunaAIService {
  private aiService = new AIService();

  detectDocumentType(text: string): DocumentType {
    const lowerText = text.toLowerCase();

    // Legal keywords
    const legalKeywords = ['contract', 'clause', 'agreement', 'liability', 'plaintiff', 'defendant', 'attorney', 'court', 'legal', 'whereas', 'hereby', 'jurisdiction'];
    const legalScore = legalKeywords.filter(kw => lowerText.includes(kw)).length;

    // Financial keywords
    const financialKeywords = ['invoice', 'payment', 'balance', 'revenue', 'expense', 'profit', 'loss', 'financial', 'account', 'transaction', 'debit', 'credit'];
    const financialScore = financialKeywords.filter(kw => lowerText.includes(kw)).length;

    // Business keywords
    const businessKeywords = ['strategy', 'company', 'operations', 'market', 'business', 'management', 'executive', 'corporate', 'stakeholder', 'growth'];
    const businessScore = businessKeywords.filter(kw => lowerText.includes(kw)).length;

    // Spiritual keywords
    const spiritualKeywords = ['faith', 'scripture', 'prayer', 'divine', 'spiritual', 'blessing', 'worship', 'holy', 'sacred', 'ministry'];
    const spiritualScore = spiritualKeywords.filter(kw => lowerText.includes(kw)).length;

    // Determine type based on highest score
    const scores = {
      legal: legalScore,
      financial: financialScore,
      business: businessScore,
      spiritual: spiritualScore
    };

    const maxScore = Math.max(...Object.values(scores));
    if (maxScore === 0) return 'general';

    return Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] as DocumentType || 'general';
  }

  async processDocumentByType(text: string, type: DocumentType) {
    const baseResult = await this.aiService.processDocument(text);

    switch (type) {
      case 'business':
        return {
          ...baseResult,
          type,
          sections: {
            executiveSummary: baseResult.summary,
            keyInsights: this.extractBusinessInsights(text),
            financialHighlights: baseResult.keyData.amounts,
            risks: this.extractRisks(text),
            actionPoints: this.extractActionPoints(text)
          }
        };

      case 'legal':
        return {
          ...baseResult,
          type,
          sections: {
            contractType: this.detectContractType(text),
            parties: baseResult.keyData.parties,
            keyClauses: baseResult.clauses,
            obligations: baseResult.keyData.obligations,
            deadlines: baseResult.keyData.dates,
            legalRisks: this.extractLegalRisks(text)
          }
        };

      case 'financial':
        return {
          ...baseResult,
          type,
          sections: {
            financialSummary: baseResult.summary,
            keyNumbers: baseResult.keyData.amounts,
            trends: this.extractTrends(text),
            riskIndicators: this.extractFinancialRisks(text)
          }
        };

      case 'spiritual':
        return {
          ...baseResult,
          type,
          sections: {
            coreMessage: baseResult.summary,
            themes: this.extractThemes(text),
            interpretation: this.extractInterpretation(text),
            lessons: this.extractLessons(text)
          }
        };

      default:
        return { ...baseResult, type };
    }
  }

  async handleChatMessage(message: string): Promise<string> {
    const lowerMessage = message.toLowerCase();

    // Platform navigation questions
    if (lowerMessage.includes('upload') || lowerMessage.includes('how to upload')) {
      return "To upload documents:\n1. Click 'Upload' in the sidebar\n2. Drag and drop your file or click 'Select Files'\n3. Supported formats: PDF, DOCX, TXT (max 10MB)\n4. Click 'Upload Files' to start AI processing\n\nProcessing usually takes 1-3 minutes!";
    }

    if (lowerMessage.includes('find documents') || lowerMessage.includes('where') && lowerMessage.includes('documents')) {
      return "You can find all your documents by:\n1. Clicking 'Documents' in the sidebar\n2. View document status (Processing/Completed)\n3. Click any document to see AI analysis results\n4. Download or delete documents from the list";
    }

    if (lowerMessage.includes('dashboard')) {
      return "The Dashboard shows:\n- Total documents uploaded\n- Processing status overview\n- Recent activity\n- Quick access to upload and documents\n\nIt's your central hub for document management!";
    }

    if (lowerMessage.includes('ai') || lowerMessage.includes('processing')) {
      return "Our AI analyzes your documents to extract:\n- Document summary\n- Key parties and dates\n- Important clauses\n- Financial amounts\n- Obligations and deadlines\n\nWe use OpenAI GPT-3.5-turbo with smart fallback for reliable results!";
    }

    // General response
    return "I'm here to help! You can ask me about:\n- How to upload documents\n- Where to find your documents\n- Understanding AI processing results\n- Navigating the platform\n\nWhat would you like to know?";
  }

  private extractBusinessInsights(text: string): string[] {
    const insights = [];
    if (/growth|increase|expand/i.test(text)) insights.push('Growth opportunities identified');
    if (/risk|challenge|concern/i.test(text)) insights.push('Risk factors present');
    if (/revenue|profit|income/i.test(text)) insights.push('Financial performance indicators found');
    return insights.length > 0 ? insights : ['General business content'];
  }

  private extractRisks(text: string): string[] {
    const risks = text.match(/risk[^.!?]*[.!?]/gi) || [];
    return risks.slice(0, 3).map(r => r.trim());
  }

  private extractActionPoints(text: string): string[] {
    const actions = text.match(/(?:must|should|need to|required to)[^.!?]*[.!?]/gi) || [];
    return actions.slice(0, 3).map(a => a.trim());
  }

  private detectContractType(text: string): string {
    if (/employment|employee/i.test(text)) return 'Employment Contract';
    if (/service|services/i.test(text)) return 'Service Agreement';
    if (/lease|rental/i.test(text)) return 'Lease Agreement';
    if (/sale|purchase/i.test(text)) return 'Sales Contract';
    return 'General Contract';
  }

  private extractLegalRisks(text: string): string[] {
    const risks = [];
    if (/liability|liable/i.test(text)) risks.push('Liability clauses present');
    if (/penalty|penalties/i.test(text)) risks.push('Penalty provisions found');
    if (/termination/i.test(text)) risks.push('Termination conditions specified');
    return risks.length > 0 ? risks : ['Standard legal terms'];
  }

  private extractTrends(text: string): string[] {
    const trends = [];
    if (/increase|growth|rise/i.test(text)) trends.push('Upward trend indicators');
    if (/decrease|decline|fall/i.test(text)) trends.push('Downward trend indicators');
    if (/stable|steady|consistent/i.test(text)) trends.push('Stable performance');
    return trends.length > 0 ? trends : ['No clear trends identified'];
  }

  private extractFinancialRisks(text: string): string[] {
    const risks = [];
    if (/debt|liability|obligation/i.test(text)) risks.push('Debt obligations present');
    if (/loss|deficit/i.test(text)) risks.push('Loss indicators found');
    if (/overdue|late|delinquent/i.test(text)) risks.push('Payment delays noted');
    return risks.length > 0 ? risks : ['Standard financial terms'];
  }

  private extractThemes(text: string): string[] {
    const themes = [];
    if (/love|compassion|kindness/i.test(text)) themes.push('Love and compassion');
    if (/faith|belief|trust/i.test(text)) themes.push('Faith and trust');
    if (/hope|future|promise/i.test(text)) themes.push('Hope and promise');
    return themes.length > 0 ? themes : ['Spiritual guidance'];
  }

  private extractInterpretation(text: string): string {
    return 'This text conveys spiritual wisdom and guidance for personal growth and understanding.';
  }

  private extractLessons(text: string): string[] {
    return ['Seek wisdom in daily life', 'Practice compassion and understanding', 'Maintain faith through challenges'];
  }
}
