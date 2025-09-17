# Unused Files Analysis for Academic Planner

## 🔍 **Analysis Summary**

After scanning the entire codebase, here are the files that appear to be **unused or potentially removable**:

## 📁 **Documentation Files (Safe to Remove)**

### **Root Level Documentation:**
- `AMPLIFY_DEPLOYMENT.md` - AWS Amplify deployment docs (not using Amplify)
- `IMPLEMENTATION_SUMMARY.md` - Old implementation summary
- `ORCHESTRATOR_WORKFLOW_SUMMARY.md` - Orchestrator documentation (can be moved to docs/)
- `ROADMAP_FEATURE.md` - Feature documentation (can be moved to docs/)

### **Orchestrator Documentation:**
- `src/lib/orchestrator/README.md` - Technical documentation (can be moved to docs/)

## 🧪 **Test & Debug Files (Safe to Remove in Production)**

### **API Test Routes:**
- `src/app/api/test/route.ts` - Basic API test endpoint
- `src/app/api/test-db/route.ts` - Database connection test
- `src/app/api/debug/env/route.ts` - Environment variables debug endpoint

### **Test Scripts:**
- `src/lib/orchestrator/test-orchestrator.ts` - Mock LLM test
- `src/lib/orchestrator/test-orchestrator-production.ts` - Production LLM test
- `src/lib/orchestrator/test-validation.ts` - Validation test

### **Admin Pages:**
- `src/app/admin/init-db/page.tsx` - Empty admin page (0 bytes)

## 🔧 **Potentially Unused Components**

### **Landing Page Components (Only used on landing page):**
- `src/components/Footer.tsx` - Old footer (replaced by NewFooter)
- `src/components/Navbar.tsx` - Old navbar (replaced by NewNavbar)
- `src/components/Hero.tsx` - Landing page hero
- `src/components/VisionStatement.tsx` - Landing page vision
- `src/components/FeatureCards.tsx` - Landing page features
- `src/components/FeatureCard.tsx` - Individual feature card
- `src/components/ProgressTracker.tsx` - Landing page progress
- `src/components/Partners.tsx` - Landing page partners
- `src/components/FAQ.tsx` - Landing page FAQ

### **Potentially Unused Components:**
- `src/components/ProgramBrowser.tsx` - May be unused (check imports)
- `src/components/RoadmapOverview.tsx` - May be unused (check imports)
- `src/components/AddPhaseButton.tsx` - May be unused (check imports)
- `src/components/CircularProgress.tsx` - May be unused (check imports)
- `src/components/ToolSidebar.tsx` - May be unused (check imports)

## 🗂️ **Potentially Unused Hooks & Services**

### **Hooks:**
- `src/app/hooks/useApplicationChecklist.ts` - May be unused
- `src/app/hooks/useProgramManagement.ts` - May be unused
- `src/app/hooks/usePrograms.ts` - May be unused
- `src/app/hooks/useSavedPrograms.ts` - May be unused

### **Services:**
- `src/lib/services/opportunityService.ts` - May be unused
- `src/lib/services/roadmapService.ts` - May be unused

## 📊 **Build Output (Safe to Remove)**

### **Static Build Files:**
- `out/` directory - Next.js build output (can be regenerated)
- `node_modules/` - Dependencies (can be reinstalled)

## 🔍 **Files to Investigate Further**

### **Custom User Profile (Vite App):**
- `src/app/custom-user-profile/src/` - Entire Vite app inside Next.js
- This seems like a separate app that might be redundant

### **Empty Directories:**
- `src/app/test-env/` - Empty directory
- `src/app/services/` - Empty directory
- `src/app/types/` - Empty directory
- `src/app/utils/` - Empty directory

## ⚠️ **Files to Keep (Important)**

### **Core Application:**
- All main page components (Dashboard, ProgramSearch, etc.)
- All API routes that are actually used
- All UI components that are imported
- All services that are imported
- All hooks that are imported

## ✅ **Cleanup Completed!**

### **1. Successfully Deleted:**
```bash
# Documentation files ✅
✅ AMPLIFY_DEPLOYMENT.md
✅ IMPLEMENTATION_SUMMARY.md
✅ ORCHESTRATOR_WORKFLOW_SUMMARY.md
✅ ROADMAP_FEATURE.md
✅ src/lib/orchestrator/README.md

# Test files ✅
✅ src/app/api/test/route.ts
✅ src/app/api/test-db/route.ts
✅ src/app/api/debug/env/route.ts
✅ src/lib/orchestrator/test-orchestrator.ts
✅ src/lib/orchestrator/test-orchestrator-production.ts
✅ src/lib/orchestrator/test-validation.ts

# Empty files ✅
✅ src/app/admin/init-db/page.tsx

# Build output ✅
✅ out/ directory

# Empty directories ✅
✅ src/app/test-env/
✅ src/app/services/
✅ src/app/types/
✅ src/app/utils/
✅ src/app/admin/
✅ src/app/api/debug/
```

### **2. Investigate Before Deleting:**
- Landing page components (if you don't need landing page)
- Custom user profile Vite app
- Potentially unused hooks and services
- Empty directories

### **3. Move to docs/ folder:**
- Keep important documentation in `docs/` folder
- Remove from root directory

## 📈 **Estimated Space Savings**

- **Documentation files**: ~50KB
- **Test files**: ~20KB
- **Build output**: ~50MB+ (regeneratable)
- **Total estimated**: ~50MB+ of unnecessary files

## 🔧 **Next Steps**

1. **Backup your code** before deleting anything
2. **Test the application** after each deletion
3. **Start with safe deletions** (documentation, tests)
4. **Investigate components** by checking imports
5. **Remove empty directories** last

Would you like me to help you delete any of these files or investigate specific components further?
