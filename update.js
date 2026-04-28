import fs from 'fs';
const filePath = 'components/onboarding-form.tsx';
let code = fs.readFileSync(filePath, 'utf8');

// 1. Add red asterisk to all labels with text-[9px]
code = code.replace(/(<Label className="text-\[9px\][^>]*>)(.*?)(<\/Label>)/g, '$1$2 <span className="text-red-500">*</span>$3');

// 2. Insert isStepValid function
const validFunc = `  const isStepValid = () => {
    switch(currentStep) {
      case 1:
        return !!(formData.fullName && formData.email && formData.phone && formData.linkedin && formData.designation && formData.secondaryEmail);
      case 2:
        return !!(formData.entityType && formData.department && formData.teamSize && formData.location && formData.language);
      case 3:
        return !!(formData.companyName && formData.industry && formData.website && formData.foundingYear && formData.gstr && formData.revenue);
      case 4:
        return !!(formData.brandColor && formData.tagline && formData.brandVoice && formData.fontStyle);
      case 5:
        return !!(formData.goal && formData.primaryChannel && formData.targetAudience && formData.integration && formData.leadGoal && formData.supportLevel);
      case 6:
        return !!(formData.botName && formData.welcomeMessage);
      default:
        return true;
    }
  };

  const nextStep = () => {`;

code = code.replace('  const nextStep = () => {', validFunc);

// 3. Update the Next button
code = code.replace(
  /onClick=\{nextStep\}\n\s*className="h-16 px-12 rounded-2xl bg-white text-black font-black hover:scale-105 transition-all shadow-\[0_20px_40px_rgba\(255,255,255,0\.1\)\]"/,
  `onClick={nextStep}
                  disabled={!isStepValid()}
                  className={cn("h-16 px-12 rounded-2xl bg-white text-black font-black transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)]", !isStepValid() ? "opacity-50 cursor-not-allowed" : "hover:scale-105")}`
);

fs.writeFileSync(filePath, code);
console.log('Update complete.');
