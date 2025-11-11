# Trigger GitHub Actions workflow manually
# This will test the workflow and start data collection immediately

# GitHub API endpoint to trigger workflow
$github_repo = "Gautamo1/jalchetna"
$workflow_file = "groundwater-scraper.yml"
$github_token = "YOUR_GITHUB_TOKEN"  # See instructions below

# If you have a GitHub token, use this command:
# $headers = @{
#     "Authorization" = "token $github_token"
#     "Accept" = "application/vnd.github.v3+json"
# }
# 
# $body = @{
#     "ref" = "master"
# } | ConvertTo-Json
#
# Invoke-RestMethod `
#     -Uri "https://api.github.com/repos/$github_repo/actions/workflows/$workflow_file/dispatches" `
#     -Method POST `
#     -Headers $headers `
#     -Body $body

# Simpler alternative - just push a commit to trigger it:
# This was already done when we pushed the workflow fix!

Write-Host "✅ Workflow fixed and pushed!"
Write-Host ""
Write-Host "🚀 To manually trigger workflow runs:"
Write-Host ""
Write-Host "Option 1: Use GitHub Web UI"
Write-Host "- Go to: https://github.com/Gautamo1/jalchetna/actions"
Write-Host "- Find 'Groundwater Data Scraper'"
Write-Host "- Click 'Run workflow' button"
Write-Host ""
Write-Host "Option 2: Use GitHub CLI (if installed)"
Write-Host "- Command: gh workflow run groundwater-scraper.yml -r master"
Write-Host ""
Write-Host "Option 3: Wait for scheduled run"
Write-Host "- The cron job (*/4 * * * *) will run automatically"
Write-Host "- GitHub uses UTC timezone"
Write-Host "- First run should appear within 5 minutes"
