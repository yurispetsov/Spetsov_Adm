
Param()

Write-Host "=== Router files referencing 'catalog' ===" -ForegroundColor Cyan
Get-ChildItem -Recurse -Path .\src\router -Include *.ts,*.js,*.mjs -ErrorAction SilentlyContinue |
  Select-String -Pattern "/catalog" -SimpleMatch | ForEach-Object {
    "{0}:{1}: {2}" -f $_.Path, $_.LineNumber, $_.Line.Trim()
  }

Write-Host "`n=== Page files possibly used for Catalog ===" -ForegroundColor Cyan
Get-ChildItem -Recurse -Path .\src -Include *Catalog*.vue,*Categories*.vue -ErrorAction SilentlyContinue |
  ForEach-Object { $_.FullName }

Write-Host "`nTip: Ensure the router points to ONE page only (prefer src/pages/catalog/CategoriesPage.vue)."
