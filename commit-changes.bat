@echo off
echo Adding all changes to git...
git add .

echo Committing changes...
git commit -m "Fix: Resolve backend data fetching issues and deployment configuration

- Fix React ESLint warnings (unused imports, missing dependencies)
- Configure proper environment files for local and production
- Update build scripts to handle warnings as non-blocking
- Add deployment documentation
- Ensure backend routes are properly configured
- Ready for production deployment"

echo Pushing to GitHub...
git push origin main

echo Done! Changes committed and pushed to GitHub.
pause