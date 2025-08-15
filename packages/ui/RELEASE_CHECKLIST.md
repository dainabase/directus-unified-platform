# ✅ RELEASE CHECKLIST v1.3.0

> **Target Date**: August 25, 2025  
> **Package**: @dainabase/ui  
> **Version**: 1.3.0  

## 🔥 IMMEDIATE ACTION REQUIRED

### NPM Token Configuration
- [ ] Create NPM account at https://www.npmjs.com/
- [ ] Generate automation token
- [ ] Add `NPM_TOKEN` to GitHub Secrets
- [ ] Verify token works with `npm whoami`

---

## 📅 Aug 19-20: Pre-Release Tests

### Morning Session
- [ ] Pull latest changes from main
- [ ] Run `node packages/ui/scripts/release-status.js`
- [ ] Run `node packages/ui/scripts/pre-release-check.js`
- [ ] All checks must pass

### Afternoon Session
- [ ] Execute `npm publish --dry-run` in packages/ui
- [ ] Verify package contents are correct
- [ ] Check bundle size is under 40KB
- [ ] Confirm version is 1.3.0

### Testing in Projects
- [ ] Test in Create React App
- [ ] Test in Next.js project
- [ ] Test in Vite project
- [ ] Test TypeScript imports

---

## 📝 Aug 21-22: Documentation Polish

### Documentation Review
- [ ] README.md is current
- [ ] CHANGELOG.md has v1.3.0 entry
- [ ] Migration guide is complete
- [ ] API reference is accurate
- [ ] All code examples work

### Marketing Prep
- [ ] Draft blog post
- [ ] Create Twitter/X announcement
- [ ] Prepare Discord message
- [ ] Design announcement graphics
- [ ] Update website if applicable

---

## 🔍 Aug 23-24: Final Quality Assurance

### Security & Performance
- [ ] Run `npm audit --production`
- [ ] Fix any high/critical vulnerabilities
- [ ] Run Lighthouse audit
- [ ] Verify 98+ performance score
- [ ] Check accessibility (WCAG AAA)

### Final Build Verification
- [ ] Clean build (`rm -rf dist && npm run build`)
- [ ] Bundle size check (`du -sh dist/`)
- [ ] TypeScript check (`npm run type-check`)
- [ ] Lint check (`npm run lint`)
- [ ] All tests pass (`npm test`)

### GitHub Preparation
- [ ] Verify NPM_TOKEN is in Secrets
- [ ] Test workflow with dry-run
- [ ] Prepare release notes
- [ ] Draft GitHub release (save as draft)

---

## 🚀 Aug 25: RELEASE DAY

### 09:00 UTC - Final Checks
- [ ] Run release-status.js one last time
- [ ] Verify main branch is clean
- [ ] Check CI/CD is green
- [ ] Team notification sent

### 10:00 UTC - Version Tagging
- [ ] Create tag: `git tag v1.3.0`
- [ ] Push tag: `git push origin v1.3.0`
- [ ] Verify tag appears on GitHub

### 10:30 UTC - NPM Publication

#### Automated Method (Preferred):
- [ ] Go to GitHub Actions
- [ ] Select "NPM Release - @dainabase/ui"
- [ ] Run workflow with dry_run = false
- [ ] Monitor workflow progress
- [ ] Verify success notification

#### Manual Backup Method:
- [ ] `cd packages/ui`
- [ ] `npm publish --access public`
- [ ] Verify at https://npmjs.com/package/@dainabase/ui

### 11:00 UTC - GitHub Release
- [ ] Publish drafted release
- [ ] Attach build artifacts
- [ ] Verify release page looks good

### 12:00 UTC - Announcements
- [ ] Post on Discord
- [ ] Tweet announcement
- [ ] LinkedIn post
- [ ] Dev.to article
- [ ] Reddit if applicable

### 14:00 UTC - Monitoring
- [ ] Check NPM page is live
- [ ] Monitor for early issues
- [ ] Respond to questions
- [ ] Check download stats

---

## 📊 Post-Release (Aug 26+)

### Day 1 Monitoring
- [ ] Check for critical issues
- [ ] Monitor NPM downloads
- [ ] Review early feedback
- [ ] Fix any urgent bugs

### Week 1 Tasks
- [ ] Gather user feedback
- [ ] Plan v1.3.1 if needed
- [ ] Update roadmap for v1.4.0
- [ ] Write retrospective

---

## 🎯 Success Criteria

All items must be checked for successful release:

- [ ] NPM package live at @dainabase/ui
- [ ] Version 1.3.0 published
- [ ] GitHub release created
- [ ] No critical issues in first 24h
- [ ] Positive initial feedback

---

## 📞 Emergency Contacts

- **Lead**: @dainabase
- **NPM Issues**: support@npmjs.com
- **GitHub Issues**: Create issue in repo
- **Discord**: discord.gg/dainabase

---

## 🔄 Rollback Plan

If critical issues arise:

1. `npm unpublish @dainabase/ui@1.3.0` (within 72h)
2. Fix issues in hotfix branch
3. Release as 1.3.1
4. Communicate transparently

---

**Last Updated**: August 15, 2025, 16:30 UTC  
**Status**: READY (pending NPM token)  
**Confidence**: 98%

---

*Check off items as completed. This is your source of truth for release day!*
