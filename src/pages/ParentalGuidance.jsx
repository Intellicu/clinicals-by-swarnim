import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Download,
  FileText,
  Heart,
  BookOpen,
  Languages,
  Search,
  ArrowLeft,
  Share2,
  Globe,
  ExternalLink,
  Sparkles,
  Loader2,
  Play,
  Film
} from "lucide-react";
import { toast } from "sonner";

const GUIDELINE_BODIES = {
  global: [
    { name: "KDIGO", full: "Kidney Disease Improving Global Outcomes", url: "https://kdigo.org" },
    { name: "IPNA", full: "International Pediatric Nephrology Association", url: "https://ipna-online.org" },
    { name: "ISPD", full: "International Society for Peritoneal Dialysis", url: "https://ispd.org" }
  ],
  regional: [
    { name: "ISPN", full: "Indian Society of Pediatric Nephrology", url: "https://ispnindia.org" },
    { name: "IAP", full: "Indian Academy of Pediatrics", url: "https://iapindia.org" },
    { name: "ESPN", full: "European Society for Paediatric Nephrology", url: "https://espn-online.org" }
  ],
  specialty: [
    { name: "AAP", full: "American Academy of Pediatrics", url: "https://aap.org" },
    { name: "NKF", full: "National Kidney Foundation", url: "https://kidney.org" },
    { name: "ERKNet", full: "European Rare Kidney Disease Network", url: "https://erknet.org" }
  ]
};

const EDUCATION_VIDEOS = [
  {
    id: "ns-explained",
    title: "Nephrotic Syndrome Explained - For Parents",
    category: "Nephrotic Syndrome",
    duration: "8:45",
    language: "English",
    source: "IPNA Education",
    thumbnail: "https://via.placeholder.com/320x180/4ade80/ffffff?text=Nephrotic+Syndrome",
    url: "https://www.youtube.com/watch?v=example",
    topics: ["What is NS", "Symptoms", "Treatment overview"]
  },
  {
    id: "dialysis-intro",
    title: "Introduction to Pediatric Dialysis",
    category: "Dialysis",
    duration: "12:30",
    language: "English/Hindi",
    source: "ISPN India",
    thumbnail: "https://via.placeholder.com/320x180/60a5fa/ffffff?text=Dialysis+Intro",
    url: "https://www.youtube.com/watch?v=example",
    topics: ["Types of dialysis", "What to expect", "Life on dialysis"]
  },
  {
    id: "ckd-nutrition",
    title: "Nutrition for Children with CKD",
    category: "CKD",
    duration: "15:20",
    language: "English",
    source: "NKF Kids",
    thumbnail: "https://via.placeholder.com/320x180/f472b6/ffffff?text=CKD+Nutrition",
    url: "https://www.youtube.com/watch?v=example",
    topics: ["Dietary guidelines", "Meal planning", "Supplements"]
  },
  {
    id: "transplant-journey",
    title: "Kidney Transplant - A Family's Journey",
    category: "Transplant",
    duration: "20:15",
    language: "English/Hindi",
    source: "MOHAN Foundation",
    thumbnail: "https://via.placeholder.com/320x180/c084fc/ffffff?text=Transplant+Journey",
    url: "https://www.youtube.com/watch?v=example",
    topics: ["Preparing for transplant", "Surgery", "Life after transplant"]
  },
  {
    id: "bp-monitoring",
    title: "How to Monitor Blood Pressure at Home",
    category: "Hypertension",
    duration: "5:30",
    language: "English/Hindi/Bengali",
    source: "AAP",
    thumbnail: "https://via.placeholder.com/320x180/fb923c/ffffff?text=BP+Monitoring",
    url: "https://www.youtube.com/watch?v=example",
    topics: ["Correct technique", "Recording values", "When to call doctor"]
  }
];

const PARENT_EDUCATION_MATERIALS = [
  {
    id: "ns-overview",
    title: "Understanding Nephrotic Syndrome",
    category: "Nephrotic Syndrome",
    languages: ["English", "Hindi", "Bengali"],
    source: "IPNA",
    sourceUrl: "https://ipna-online.org",
    description: "Comprehensive guide to nephrotic syndrome for parents - what it is, symptoms, treatment, and home care",
    topics: ["What is nephrotic syndrome?", "Recognizing relapse", "Steroid therapy", "Diet and fluid management", "When to call the doctor"],
    downloadUrl: "/resources/ns-parent-guide.pdf",
    content: `# Understanding Nephrotic Syndrome - A Parent's Guide

## What is Nephrotic Syndrome?

Nephrotic syndrome is a kidney condition where the kidneys leak protein into the urine. This causes:
- Swelling (edema) - especially around eyes, feet, and abdomen
- Foamy urine (due to protein)
- Low protein in blood
- High cholesterol

## Common Questions

**Is it curable?**
Most children (90%) respond well to steroids. Many outgrow it by teenage years.

**Is it contagious?**
No, nephrotic syndrome is not contagious. Your child can attend school when well.

**What causes relapse?**
Common triggers include infections (colds, flu), allergies, and stress.

## Treatment: Steroid Therapy

### Initial Treatment
- Prednisolone: 2 mg/kg/day for 4-6 weeks
- Given as single morning dose
- DO NOT stop suddenly - must taper gradually

### Side Effects to Watch
- Increased appetite and weight gain
- Mood changes (irritability, hyperactivity)
- Stomach upset - give with food
- Increased infection risk
- Growth suppression with long-term use

### Tips for Managing Steroids
- Give in morning to reduce sleep problems
- Never skip doses without doctor's approval
- Keep a medication diary
- Protect from infections - good hand hygiene

## Home Monitoring

### Daily Checks
1. **Morning weight** - same time, after toilet, before eating
2. **Urine protein** - dipstick test daily
3. **Swelling** - check eyes, feet, abdomen
4. **Blood pressure** - if available at home

### When to Call Doctor IMMEDIATELY
- Severe swelling or difficulty breathing
- Severe abdominal pain or vomiting
- Fever >100.4°F (38°C)
- Blood in urine
- Seizures or severe headache
- Urine output <2-3 times/day

## Diet and Fluid Management

### During Relapse (When Swollen)
- **Low salt** - no added salt, avoid packaged foods
- **Fluid restriction** - only if doctor advises
- **Normal protein** - eggs, dal, chicken (don't restrict)

### During Remission (When Well)
- Normal healthy diet
- No restrictions needed
- Ensure adequate protein for growth

## School and Activities

### Can Attend School When:
- No fever
- Feeling well
- Urine protein negative or trace
- On maintenance steroid dose

### Activity Restrictions
- Avoid contact sports during high-dose steroids
- Swimming OK when in remission
- Encourage normal play and social life

## Infections Prevention

Children on steroids are at higher risk:
- Practice good hand hygiene
- Avoid contact with sick people
- Get annual flu vaccine
- Chickenpox vaccine important (give when not on steroids)
- If exposed to chickenpox while on steroids - contact doctor immediately

## Long-term Outlook

**Good News:**
- 90% of children respond to steroids
- 50-60% may relapse but respond again
- Most children become relapse-free by teenage years
- Kidney function usually remains normal

**Follow-up:**
- Regular clinic visits (every 3-6 months when well)
- Periodic blood tests and blood pressure checks
- Growth monitoring
- Eye checks if on long-term steroids

## Support and Resources

- Join parent support groups
- Connect with other families
- Ask your doctor questions - there are no silly questions
- Keep a health diary

Remember: You are not alone. With proper treatment and monitoring, most children with nephrotic syndrome lead normal, healthy lives.`
  },
  {
    id: "ckd-basics",
    title: "Chronic Kidney Disease in Children",
    category: "CKD",
    languages: ["English", "Hindi"],
    source: "NKF Kids",
    sourceUrl: "https://www.kidney.org/patients/bw/bw_childkid",
    description: "What parents need to know about CKD in children - stages, treatment, and supporting your child",
    topics: ["CKD stages", "Medications", "Diet", "Growth concerns", "Preparing for dialysis/transplant"],
    downloadUrl: "/resources/ckd-parent-guide.pdf",
    content: `# Chronic Kidney Disease (CKD) - Parent's Guide

## Understanding CKD

CKD means your child's kidneys are not working as well as they should. Kidneys have many important jobs:
- Remove waste and extra water from blood
- Keep blood pressure normal
- Make red blood cells
- Keep bones strong
- Help children grow

## CKD Stages

**Stage 1-2:** Kidney function >60% - Few symptoms, focus on slowing progression
**Stage 3:** Kidney function 30-60% - May have mild symptoms, manage complications
**Stage 4:** Kidney function 15-30% - Prepare for dialysis or transplant
**Stage 5:** Kidney function <15% - Need dialysis or transplant

## Common Symptoms

Early stages may have no symptoms. As CKD progresses:
- Fatigue, poor energy
- Poor appetite
- Nausea or vomiting
- Swelling (edema)
- Shortness of breath
- High blood pressure
- Poor growth

## Medications Your Child May Need

### Blood Pressure Control
- ACE inhibitors (Enalapril) - protect kidneys
- Take exactly as prescribed
- Monitor blood pressure at home

### Anemia Treatment
- Iron supplements
- Erythropoietin injections (EPO)
- Helps with energy and growth

### Bone Health
- Vitamin D and calcium supplements
- Phosphate binders with meals
- Keeps bones strong, prevents deformities

### Growth Support
- Growth hormone injections (if needed)
- Given daily at bedtime
- Helps children reach normal height

## Diet Guidelines

### General Principles
- Adequate calories for growth
- Enough protein but not excessive
- Control salt intake
- Manage potassium and phosphorus

### Foods to Limit (as advised by dietitian)
- High salt foods (chips, pickles, packaged foods)
- High phosphorus (dairy, cola drinks, processed foods)
- High potassium (bananas, oranges, tomatoes) - only in advanced CKD

### Encouraged Foods
- Fresh fruits and vegetables (as allowed)
- Whole grains
- Lean proteins (chicken, fish, eggs)
- Healthy fats (olive oil, nuts in moderation)

## Growth and Development

CKD can affect growth:
- Regular height and weight measurements
- Growth hormone therapy if needed
- Adequate nutrition is critical
- Manage anemia and bone disease
- Most children can achieve near-normal height with treatment

## School and Activities

### Inform School About:
- Medical condition and medications
- Dietary restrictions
- Signs of illness to watch for
- Emergency contacts

### Activity Guidelines
- Encourage normal play and sports
- May need rest periods if anemic
- Avoid dehydration
- No restrictions unless advised by doctor

## Emotional Support

### For Your Child
- Normalize their condition
- Encourage independence
- Connect with other children with CKD
- Professional counseling if needed
- Maintain routines and expectations

### For Parents and Siblings
- Take care of your own mental health
- Family counseling available
- Support groups for parents
- Ensure siblings don't feel neglected

## Preparing for Dialysis or Transplant

### Dialysis
- Hemodialysis: 3-4 hours, 3 times per week at center
- Peritoneal dialysis: Daily at home, done by parents
- Your team will help you choose the best option

### Kidney Transplant
- Best long-term option for children
- Living donor (family member) often possible
- Excellent outcomes - most children live normal lives
- Still requires medications and monitoring

## Emergency Warning Signs

Call doctor immediately if:
- Severe swelling or difficulty breathing
- Chest pain
- Seizures or confusion
- Fever >100.4°F (38°C)
- Severe vomiting or diarrhea
- Very little urine output
- Blood in urine or stool

## Your Healthcare Team

- Pediatric Nephrologist
- Nurse Coordinator
- Dietitian
- Social Worker
- Psychologist
- Pharmacist

Don't hesitate to contact your team with questions or concerns!

## Remember

- CKD is manageable with proper care
- Children with CKD can lead full, active lives
- Advances in treatment are constantly improving outcomes
- Transplantation offers excellent quality of life
- You are your child's best advocate`
  },
  {
    id: "dialysis-preparation",
    title: "Preparing for Dialysis - Family Guide",
    category: "Dialysis",
    languages: ["English", "Hindi", "Bengali"],
    source: "ISPD",
    sourceUrl: "https://ispd.org",
    description: "Complete guide to dialysis for families - types, what to expect, and life on dialysis",
    topics: ["Hemodialysis vs PD", "Access procedures", "Daily routine", "Dietary changes", "School and travel"],
    downloadUrl: "/resources/dialysis-family-guide.pdf",
    content: `# Preparing for Dialysis - A Family Guide

## Understanding Dialysis

When kidneys fail, dialysis does the job of removing waste and extra fluid from blood. There are two main types:

### Hemodialysis (HD)
- Done at a dialysis center
- 3-4 times per week, 3-4 hours each session
- Blood filtered through a machine
- Requires vascular access (fistula, graft, or catheter)

### Peritoneal Dialysis (PD)
- Done at home by parents/child
- Daily, usually at night while sleeping
- Uses belly lining (peritoneum) as filter
- Requires catheter in abdomen

## Choosing the Right Dialysis

Both types work well. Consider:
- Family schedule and work
- School arrangements
- Home space availability
- Child's age and independence
- Family comfort with procedures

## Hemodialysis: What to Expect

### Before Starting
- Surgery to create access (fistula or catheter)
- Takes 2-3 months for fistula to mature
- Training sessions at dialysis center

### During Sessions
- Check weight and blood pressure
- Connect to machine via access
- Child can watch TV, do homework, play games
- May feel tired during or after
- Light snacks usually allowed

### After Dialysis
- Common to feel tired for a few hours
- Rest recommended
- Resume normal activities next day

## Peritoneal Dialysis: What to Expect

### Before Starting
- Surgery to place catheter in abdomen
- 2-3 weeks healing before starting dialysis
- Family training (usually 1-2 weeks)

### Daily Routine
- Automated PD (APD/CCPD): Machine does exchanges at night (8-10 hours)
- Continuous Ambulatory PD (CAPD): Manual exchanges 4 times daily
- Each exchange: Drain old fluid, fill with fresh
- Clean technique is critical

### Supplies Management
- Monthly delivery of dialysis supplies
- Need dedicated storage space
- Supplies usually covered by insurance/government

## Access Care

### For HD Fistula/Graft
- Keep area clean and dry
- Feel for "thrill" (buzzing sensation) daily
- No blood pressure or blood draws on that arm
- Watch for redness, pain, or swelling

### For PD Catheter
- Daily exit site care with antibacterial soap
- Keep exit site dry (no swimming/baths initially)
- Secure catheter to prevent pulling
- Watch for redness, discharge, or pain

## Diet on Dialysis

### Hemodialysis Diet
- **Fluid restriction** - usually 1000-1500 mL/day
- **Low potassium** - limit bananas, oranges, potatoes, tomatoes
- **Low phosphorus** - limit dairy, cola, processed foods
- **Low sodium** - avoid salty foods
- **Adequate protein** - need more protein on HD

### Peritoneal Dialysis Diet
- **Less fluid restriction** - PD removes fluid daily
- **More flexible potassium** - kidneys still working somewhat
- **Still limit phosphorus**
- **High protein** - losing protein in dialysate
- **Watch calories** - absorbing glucose from dialysate (weight gain possible)

## School and Dialysis

### For HD Patients
- Schedule sessions after school or weekends
- May miss some school days
- Inform school about medical condition
- Arrange make-up work

### For PD Patients
- Full school attendance possible
- May need restroom access for emergencies
- Inform school nurse about catheter
- No swimming without doctor approval

## Activities and Travel

### Sports and Activities
- Swimming: Usually allowed after healing, use special dressings
- Contact sports: Discuss with doctor (risk to access)
- Most activities are fine with precautions

### Travel
- HD: Arrange dialysis at destination center (book early!)
- PD: Take supplies with you, plan storage
- Carry medical information and emergency contacts

## Complications to Watch For

### HD Complications
- Low blood pressure during dialysis
- Cramping
- Access infection or clotting
- Headaches
- Nausea

### PD Complications
- Peritonitis (infection) - cloudy fluid, abdominal pain, fever
- Exit site infection
- Catheter problems (leak, blockage)
- Hernias

## Transitioning to Transplant

- Dialysis is usually temporary
- Most children receive transplant within 2-3 years
- Continue dialysis until transplant
- Dialysis can continue after transplant if needed

## Emotional and Social Support

### For Your Child
- Normalize dialysis - it's part of their routine
- Connect with other children on dialysis
- Encourage independence as they grow
- Maintain discipline and expectations

### For Family
- Respite care available for PD families
- Support groups for parents
- Financial counseling - many programs available
- Online communities

## Emergency Situations

Call doctor immediately:
- **HD:** Redness, pain, or no thrill in access; Fever; Chest pain; Severe bleeding
- **PD:** Cloudy dialysate; Severe abdominal pain; Fever; Catheter came out partially

## Financial Assistance

- Government schemes (PMJAY, state programs)
- NGO support
- Hospital social workers can help
- Many medications and supplies covered

## Remember

- Dialysis allows children to live, grow, and thrive
- Thousands of children worldwide are on dialysis
- Quality of life can be excellent
- Transplant offers even better outcomes
- You and your team will work together for the best care

Your child can still have a happy, fulfilling childhood on dialysis!`
  },
  {
    id: "kidney-biopsy",
    title: "Kidney Biopsy - What Parents Need to Know",
    category: "Procedures",
    languages: ["English", "Hindi"],
    source: "Great Ormond Street Hospital",
    sourceUrl: "https://www.gosh.nhs.uk",
    description: "Complete guide to kidney biopsy - why it's needed, how it's done, and aftercare",
    topics: ["Why biopsy is needed", "Procedure details", "Preparation", "After biopsy care", "Results timeline"],
    downloadUrl: "/resources/kidney-biopsy-guide.pdf"
  },
  {
    id: "hypertension-home",
    title: "Managing High Blood Pressure at Home",
    category: "Hypertension",
    languages: ["English", "Hindi", "Bengali"],
    source: "IAP",
    sourceUrl: "https://iapindia.org",
    description: "Home blood pressure monitoring, lifestyle changes, and when to seek help",
    topics: ["How to measure BP correctly", "BP targets", "DASH diet", "Medication adherence", "Emergency signs"],
    downloadUrl: "/resources/hypertension-home-guide.pdf"
  },
  {
    id: "uti-prevention",
    title: "Urinary Tract Infections - Prevention and Care",
    category: "UTI",
    languages: ["English", "Hindi", "Bengali"],
    source: "ISPN India",
    description: "Preventing recurrent UTIs, recognizing symptoms, and proper hygiene",
    topics: ["Hygiene practices", "Recognizing UTI symptoms", "Antibiotic prophylaxis", "When to call doctor"],
    downloadUrl: "/resources/uti-prevention-guide.pdf"
  }
];

export default function ParentalGuidance() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeLanguage, setActiveLanguage] = useState("All");
  const [expandedMaterial, setExpandedMaterial] = useState(null);
  const [showLeafletGenerator, setShowLeafletGenerator] = useState(false);
  const [showWebSearch, setShowWebSearch] = useState(false);
  const [leafletForm, setLeafletForm] = useState({
    diagnosis: "",
    treatment: "",
    language: "English",
    ageGroup: "5-12 years",
    readingLevel: "simple"
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLeaflet, setGeneratedLeaflet] = useState(null);
  const [webSearchQuery, setWebSearchQuery] = useState("");
  const [webSearchResults, setWebSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const categories = ["All", ...new Set(PARENT_EDUCATION_MATERIALS.map(m => m.category))];
  const languages = ["All", "English", "Hindi", "Bengali"];

  const filteredMaterials = PARENT_EDUCATION_MATERIALS.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || material.category === activeCategory;
    const matchesLanguage = activeLanguage === "All" || material.languages.includes(activeLanguage);
    return matchesSearch && matchesCategory && matchesLanguage;
  });

  const handleDownload = (material) => {
    const content = material.content || `# ${material.title}\n\n${material.description}\n\nContent available at: ${material.sourceUrl}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${material.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    toast.success('Downloaded successfully!');
  };

  const handleShare = (material) => {
    if (navigator.share) {
      navigator.share({
        title: material.title,
        text: material.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`${material.title}\n\n${material.description}\n\nSource: ${material.sourceUrl}`);
      toast.success('Link copied to clipboard!');
    }
  };

  const generatePatientLeaflet = async () => {
    if (!leafletForm.diagnosis || !leafletForm.treatment) {
      toast.error("Please provide diagnosis and treatment details");
      return;
    }

    setIsGenerating(true);
    toast.info("Generating patient-friendly leaflet...", { id: "leaflet-gen", duration: Infinity });

    try {
      const prompt = `Create a patient education leaflet for parents/caregivers in ${leafletForm.language} language.

TARGET AUDIENCE: Parents of children ${leafletForm.ageGroup}
READING LEVEL: ${leafletForm.readingLevel} language (${leafletForm.readingLevel === 'simple' ? 'grade 6-8 level' : leafletForm.readingLevel === 'moderate' ? 'grade 9-12 level' : 'medical professional level'})

DIAGNOSIS: ${leafletForm.diagnosis}
TREATMENT: ${leafletForm.treatment}

STRUCTURE THE LEAFLET AS FOLLOWS:

# ${leafletForm.diagnosis} - Parent's Guide

## What is ${leafletForm.diagnosis}?
[Simple explanation in 2-3 paragraphs using analogies parents understand]

## Common Symptoms to Watch For
[Bullet points of symptoms, when to worry vs when it's normal]

## Treatment: ${leafletForm.treatment}
### How it works
### What to expect
### Common side effects
### Tips for success

## Home Care Instructions
[Daily monitoring, what to do, what to avoid]

## When to Call the Doctor IMMEDIATELY
[Red flag symptoms requiring urgent attention]

## Diet and Lifestyle
[Practical advice for daily living]

## Long-term Outlook
[Realistic expectations, prognosis]

## Questions to Ask Your Doctor
[5-7 important questions parents should discuss]

IMPORTANT GUIDELINES TO REFERENCE:
- KDIGO guidelines (if applicable)
- IPNA pediatric recommendations
- ISPN India guidelines (for Indian context)
- AAP clinical practice guidelines

FORMAT: Use clear headings, bullet points, simple analogies. Avoid medical jargon. If technical terms needed, explain them. Be reassuring but honest.

Generate the complete leaflet now:`;

      const leaflet = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true
      });

      setGeneratedLeaflet({
        title: `${leafletForm.diagnosis} - Parent's Guide`,
        content: leaflet,
        language: leafletForm.language,
        generatedAt: new Date().toISOString(),
        diagnosis: leafletForm.diagnosis,
        treatment: leafletForm.treatment
      });

      toast.success("Leaflet generated!", { id: "leaflet-gen" });
    } catch (error) {
      console.error("Leaflet generation error:", error);
      toast.error("Failed to generate leaflet. Please try again.", { id: "leaflet-gen" });
    } finally {
      setIsGenerating(false);
    }
  };

  const searchInternetResources = async () => {
    if (!webSearchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setIsSearching(true);
    toast.info("Searching for educational materials...", { id: "web-search", duration: Infinity });

    try {
      const prompt = `Search the internet for patient education materials about: "${webSearchQuery}"

Focus on finding:
1. Patient-friendly articles from reputable sources (KDIGO, IPNA, ISPN, NKF, AAP, major children's hospitals)
2. Educational videos (YouTube channels from medical institutions)
3. Downloadable PDF guides
4. Support group resources
5. Multi-language content (English, Hindi, Bengali, etc.)

For each resource found, provide:
- Title
- Source (organization/hospital name)
- URL
- Brief description (2-3 sentences)
- Type (Article/Video/PDF/Guide)
- Language availability

Return results as JSON array:
[
  {
    "title": "...",
    "source": "...",
    "url": "...",
    "description": "...",
    "type": "...",
    "languages": ["..."]
  }
]

Find 5-8 high-quality, authoritative resources.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            results: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  source: { type: "string" },
                  url: { type: "string" },
                  description: { type: "string" },
                  type: { type: "string" },
                  languages: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      setWebSearchResults(response.results || []);
      toast.success(`Found ${response.results?.length || 0} resources`, { id: "web-search" });
    } catch (error) {
      console.error("Web search error:", error);
      toast.error("Search failed. Please try again.", { id: "web-search" });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Link to={createPageUrl("Hub")}>
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hub
          </Button>
        </Link>

        <div className="mb-8">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Parental Guidance & Education</h1>
                <p className="text-slate-600">Evidence-based resources to help families understand and manage kidney conditions</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Dialog open={showLeafletGenerator} onOpenChange={setShowLeafletGenerator}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Leaflet
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      AI-Powered Patient Leaflet Generator
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Alert className="bg-blue-50 border-blue-200">
                      <AlertDescription className="text-blue-900 text-sm">
                        Generate custom patient education materials based on diagnosis and treatment. Content is sourced from KDIGO, IPNA, ISPN, and AAP guidelines.
                      </AlertDescription>
                    </Alert>

                    <div>
                      <Label>Diagnosis *</Label>
                      <Input
                        value={leafletForm.diagnosis}
                        onChange={(e) => setLeafletForm({...leafletForm, diagnosis: e.target.value})}
                        placeholder="e.g., Nephrotic Syndrome, Chronic Kidney Disease Stage 3"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Treatment Plan *</Label>
                      <Textarea
                        value={leafletForm.treatment}
                        onChange={(e) => setLeafletForm({...leafletForm, treatment: e.target.value})}
                        placeholder="e.g., Prednisolone 2mg/kg/day for 6 weeks, then alternate day taper"
                        rows={3}
                        className="mt-1"
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label>Language</Label>
                        <Select value={leafletForm.language} onValueChange={(val) => setLeafletForm({...leafletForm, language: val})}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="English">English</SelectItem>
                            <SelectItem value="Hindi">हिन्दी (Hindi)</SelectItem>
                            <SelectItem value="Bengali">বাংলা (Bengali)</SelectItem>
                            <SelectItem value="Tamil">தமிழ் (Tamil)</SelectItem>
                            <SelectItem value="Telugu">తెలుగు (Telugu)</SelectItem>
                            <SelectItem value="Marathi">मराठी (Marathi)</SelectItem>
                            <SelectItem value="Gujarati">ગુજરાતી (Gujarati)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Age Group</Label>
                        <Select value={leafletForm.ageGroup} onValueChange={(val) => setLeafletForm({...leafletForm, ageGroup: val})}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0-4 years">0-4 years (Toddler)</SelectItem>
                            <SelectItem value="5-12 years">5-12 years (Child)</SelectItem>
                            <SelectItem value="13-18 years">13-18 years (Teen)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Reading Level</Label>
                        <Select value={leafletForm.readingLevel} onValueChange={(val) => setLeafletForm({...leafletForm, readingLevel: val})}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="simple">Simple (Grade 6-8)</SelectItem>
                            <SelectItem value="moderate">Moderate (Grade 9-12)</SelectItem>
                            <SelectItem value="advanced">Advanced (Medical)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button
                      onClick={generatePatientLeaflet}
                      disabled={isGenerating || !leafletForm.diagnosis || !leafletForm.treatment}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Patient Leaflet
                        </>
                      )}
                    </Button>

                    {generatedLeaflet && (
                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-bold text-lg text-slate-900">{generatedLeaflet.title}</h3>
                          <Button
                            size="sm"
                            onClick={() => handleDownload({
                              title: generatedLeaflet.title,
                              content: generatedLeaflet.content,
                              language: generatedLeaflet.language
                            })}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg max-h-96 overflow-y-auto border">
                          <pre className="text-sm whitespace-pre-wrap text-slate-800 font-sans leading-relaxed">
                            {generatedLeaflet.content}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showWebSearch} onOpenChange={setShowWebSearch}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-blue-300 text-blue-700">
                    <Search className="w-4 h-4 mr-2" />
                    Web Search
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-blue-600" />
                      Search Internet for Education Materials
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Alert className="bg-green-50 border-green-200">
                      <AlertDescription className="text-green-900 text-sm">
                        Search for patient education materials from KDIGO, IPNA, ISPN, NKF, AAP, and major children's hospitals worldwide.
                      </AlertDescription>
                    </Alert>

                    <div className="flex gap-2">
                      <Input
                        value={webSearchQuery}
                        onChange={(e) => setWebSearchQuery(e.target.value)}
                        placeholder="e.g., pediatric nephrotic syndrome parent guide"
                        onKeyPress={(e) => e.key === 'Enter' && searchInternetResources()}
                      />
                      <Button onClick={searchInternetResources} disabled={isSearching}>
                        {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      </Button>
                    </div>

                    {webSearchResults.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-semibold text-slate-900">Search Results ({webSearchResults.length})</h3>
                        {webSearchResults.map((result, idx) => (
                          <Card key={idx} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-slate-900 mb-1">{result.title}</h4>
                                  <p className="text-xs text-slate-600 mb-2">{result.description}</p>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="outline" className="text-xs">{result.source}</Badge>
                                    <Badge className="text-xs bg-blue-100 text-blue-800">{result.type}</Badge>
                                    {result.languages && result.languages.length > 0 && (
                                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                                        <Languages className="w-3 h-3" />
                                        {result.languages.join(", ")}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <a
                                  href={result.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-4"
                                >
                                  <Button size="sm" variant="outline">
                                    <ExternalLink className="w-4 h-4" />
                                  </Button>
                                </a>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search parent resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12"
              />
            </div>
          </div>

          <Tabs defaultValue="category" className="mb-6">
            <TabsList>
              <TabsTrigger value="category">By Category</TabsTrigger>
              <TabsTrigger value="language">By Language</TabsTrigger>
            </TabsList>

            <TabsContent value="category" className="mt-4">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={activeCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(cat)}
                    className={activeCategory === cat ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="language" className="mt-4">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {languages.map((lang) => (
                  <Button
                    key={lang}
                    variant={activeLanguage === lang ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveLanguage(lang)}
                    className={activeLanguage === lang ? "bg-blue-600 hover:bg-blue-700" : ""}
                  >
                    <Languages className="w-4 h-4 mr-2" />
                    {lang}
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <Tabs defaultValue="leaflets" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="leaflets">📄 Leaflets</TabsTrigger>
            <TabsTrigger value="videos">🎥 Videos</TabsTrigger>
            <TabsTrigger value="guidelines">📚 Guidelines</TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {EDUCATION_VIDEOS.map((video) => (
                <Card key={video.id} className="bg-white shadow-lg hover:shadow-xl transition-all border-2 hover:border-blue-400">
                  <div className="relative">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-t-lg group-hover:bg-black/40 transition-colors">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                        <Play className="w-8 h-8 text-blue-600 ml-1" />
                      </div>
                    </div>
                    <Badge className="absolute top-3 right-3 bg-black/70 text-white">
                      {video.duration}
                    </Badge>
                  </div>
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b">
                    <div className="flex items-start justify-between mb-2">
                      <Film className="w-6 h-6 text-blue-600" />
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 text-xs">
                        {video.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-bold text-slate-900">
                      {video.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Languages className="w-4 h-4" />
                        <span>{video.language}</span>
                      </div>
                      <div className="bg-blue-50 p-3 rounded border border-blue-200">
                        <p className="text-xs font-semibold text-blue-900 mb-1">Topics:</p>
                        <ul className="text-xs text-blue-800 space-y-1">
                          {video.topics.map((topic, idx) => (
                            <li key={idx}>• {topic}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Source: {video.source}</span>
                      </div>
                    </div>
                    <a href={video.url} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                        <Play className="w-4 h-4 mr-2" />
                        Watch Video
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="guidelines" className="mt-6">
            <div className="space-y-6">
              <Alert className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <AlertDescription>
                  <strong className="text-purple-900">Authoritative Guideline Bodies:</strong>
                  <p className="text-purple-800 text-sm mt-1">
                    All educational materials are based on evidence from leading pediatric nephrology organizations worldwide.
                  </p>
                </AlertDescription>
              </Alert>

              {Object.entries(GUIDELINE_BODIES).map(([category, bodies]) => (
                <Card key={category} className="shadow-lg border-2">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50 border-b">
                    <CardTitle className="capitalize text-lg">
                      {category === 'global' && '🌍 Global Guidelines'}
                      {category === 'regional' && '🌏 Regional Guidelines'}
                      {category === 'specialty' && '⚕️ Specialty Guidelines'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      {bodies.map((body) => (
                        <div key={body.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border hover:border-purple-300 transition-colors">
                          <div>
                            <h4 className="font-bold text-slate-900">{body.name}</h4>
                            <p className="text-sm text-slate-600">{body.full}</p>
                          </div>
                          <a href={body.url} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Visit
                            </Button>
                          </a>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="leaflets" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => (
            <Card key={material.id} className="bg-white shadow-lg hover:shadow-xl transition-all border-2 hover:border-green-400">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-green-50 border-b">
                <div className="flex items-start justify-between mb-2">
                  <BookOpen className="w-8 h-8 text-green-600" />
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                    {material.category}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-bold text-slate-900">
                  {material.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm text-slate-600 mb-4">
                  {material.description}
                </p>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Globe className="w-4 h-4" />
                    <span>Available in: {material.languages.join(", ")}</span>
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded border border-blue-200">
                    <p className="text-xs font-semibold text-blue-900 mb-1">Topics Covered:</p>
                    <ul className="text-xs text-blue-800 space-y-1">
                      {material.topics.slice(0, 3).map((topic, idx) => (
                        <li key={idx}>• {topic}</li>
                      ))}
                      {material.topics.length > 3 && (
                        <li className="text-blue-600 font-semibold">+ {material.topics.length - 3} more topics</li>
                      )}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Source: {material.source}</span>
                    <a href={material.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      Visit
                    </a>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleDownload(material)}
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    onClick={() => handleShare(material)}
                    size="sm"
                    variant="outline"
                    className="flex-1 border-green-300 text-green-700"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>

                {material.content && (
                  <Button
                    onClick={() => setExpandedMaterial(expandedMaterial === material.id ? null : material.id)}
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 text-xs"
                  >
                    {expandedMaterial === material.id ? 'Hide Preview' : 'Preview Content'}
                  </Button>
                )}

                {expandedMaterial === material.id && material.content && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg border max-h-96 overflow-y-auto">
                    <pre className="text-xs whitespace-pre-wrap text-slate-800 font-sans">
                      {material.content.substring(0, 2000)}...
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
            </div>
          </TabsContent>
        </Tabs>

        <Card className="mt-12 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <FileText className="w-8 h-8 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-green-900 mb-3 text-lg">How to Use These Resources</h3>
                <ul className="text-sm text-slate-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>Download:</strong> Save materials as text files to read offline or print at home</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>Share:</strong> Send resources to family members, teachers, or caregivers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>Languages:</strong> Materials available in English, Hindi, and Bengali for wider accessibility</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>Sources:</strong> All content based on IPNA, IAP, ISPD, NKF, and major hospital guidelines</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>Ask Your Doctor:</strong> Use these as conversation starters during clinic visits</span>
                  </li>
                </ul>

                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-900">
                    <strong className="flex items-center gap-2 mb-1">
                      <Heart className="w-4 h-4" />
                      Important Note:
                    </strong>
                    These materials are for educational purposes only and do not replace professional medical advice. Always consult your child's nephrologist for personalized guidance.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}