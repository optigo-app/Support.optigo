Add-Type -AssemblyName System.Drawing

$srcDir = "e:\Rajan\module\call logger\src\assets\appicons"
$outPublic = "e:\Rajan\module\call logger\public\appicons"
$outSrcOptimized = "e:\Rajan\module\call logger\src\assets\appicons\optimized"

if (!(Test-Path $outPublic)) { New-Item -ItemType Directory -Path $outPublic -Force }
if (!(Test-Path $outSrcOptimized)) { New-Item -ItemType Directory -Path $outSrcOptimized -Force }

function Create-Resized-Bitmap {
    param(
        [System.Drawing.Image]$sourceImage,
        [int]$targetWidth,
        [int]$targetHeight
    )
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $targetWidth, $targetHeight)
    $destImage = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $destImage.SetResolution($sourceImage.HorizontalResolution, $sourceImage.VerticalResolution)

    $graphics = [System.Drawing.Graphics]::FromImage($destImage)
    $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $wrapMode = New-Object System.Drawing.Imaging.ImageAttributes
    $wrapMode.SetWrapMode([System.Drawing.Drawing2D.WrapMode]::TileFlipXY)

    $graphics.DrawImage($sourceImage, $destRect, 0, 0, $sourceImage.Width, $sourceImage.Height, [System.Drawing.GraphicsUnit]::Pixel, $wrapMode)
    $graphics.Dispose()

    return $destImage
}

function Save-Image-Variants {
    param(
        [System.Drawing.Bitmap]$bmp,
        [string]$baseName
    )
    # 512
    $b512 = Create-Resized-Bitmap -sourceImage $bmp -targetWidth 512 -targetHeight 512
    $b512.Save((Join-Path $outPublic "$baseName-512.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $b512.Dispose()

    # 192
    $b192 = Create-Resized-Bitmap -sourceImage $bmp -targetWidth 192 -targetHeight 192
    $b192.Save((Join-Path $outPublic "$baseName-192.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $b192.Save((Join-Path $outPublic "$baseName.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $b192.Save((Join-Path $outSrcOptimized "$baseName.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $b192.Dispose()

    # 64
    $b64 = Create-Resized-Bitmap -sourceImage $bmp -targetWidth 64 -targetHeight 64
    $b64.Save((Join-Path $outPublic "$baseName-favicon-64.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $b64.Dispose()

    # 32
    $b32 = Create-Resized-Bitmap -sourceImage $bmp -targetWidth 32 -targetHeight 32
    $b32.Save((Join-Path $outPublic "$baseName-favicon-32.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $b32.Dispose()
}

# 1. Process base icons: call, order, ticket, training
$baseFiles = @("call", "order", "ticket", "training")
foreach ($name in $baseFiles) {
    $filePath = Join-Path $srcDir "$name.png"
    if (Test-Path $filePath) {
        $img = [System.Drawing.Image]::FromFile($filePath)
        Write-Host "Processing $name..."
        Save-Image-Variants -bmp $img -baseName $name
        $img.Dispose()
    }
}

# 2. Create specialized badged icons for NewCall and Archive
$callPath = Join-Path $srcDir "call.png"
if (Test-Path $callPath) {
    # ── New Call Badge (Plus indicator badge) ──
    $callImg = [System.Drawing.Image]::FromFile($callPath)
    $newCallBmp = Create-Resized-Bitmap -sourceImage $callImg -targetWidth 512 -targetHeight 512
    $g = [System.Drawing.Graphics]::FromImage($newCallBmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

    # Circle badge at bottom-right
    $badgeX = 330
    $badgeY = 330
    $badgeSize = 150
    $badgeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 16, 185, 129)) # Emerald green
    $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, 16)
    
    $g.FillEllipse($badgeBrush, $badgeX, $badgeY, $badgeSize, $badgeSize)
    $g.DrawEllipse($borderPen, $badgeX, $badgeY, $badgeSize, $badgeSize)

    # Plus sign
    $plusPen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, 20)
    $plusPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $plusPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $centerX = $badgeX + ($badgeSize / 2)
    $centerY = $badgeY + ($badgeSize / 2)
    $arm = 36
    $g.DrawLine($plusPen, $centerX - $arm, $centerY, $centerX + $arm, $centerY)
    $g.DrawLine($plusPen, $centerX, $centerY - $arm, $centerX, $centerY + $arm)

    $g.Dispose()
    Write-Host "Generating specialized newcall icon..."
    Save-Image-Variants -bmp $newCallBmp -baseName "newcall"
    $newCallBmp.Dispose()

    # ── Archive Badge (Archive box badge) ──
    $archiveBmp = Create-Resized-Bitmap -sourceImage $callImg -targetWidth 512 -targetHeight 512
    $g2 = [System.Drawing.Graphics]::FromImage($archiveBmp)
    $g2.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

    # Circle badge at bottom-right
    $archBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 100, 116, 139)) # Slate / Archive gray-blue
    $g2.FillEllipse($archBrush, $badgeX, $badgeY, $badgeSize, $badgeSize)
    $g2.DrawEllipse($borderPen, $badgeX, $badgeY, $badgeSize, $badgeSize)

    # Archive drawer symbol
    $archPen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, 12)
    $archPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $archPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    
    # Top box
    $g2.DrawRectangle($archPen, $centerX - 35, $centerY - 30, 70, 24)
    # Bottom box
    $g2.DrawRectangle($archPen, $centerX - 35, $centerY + 2, 70, 32)
    # Handle
    $g2.DrawLine($archPen, $centerX - 15, $centerY + 16, $centerX + 15, $centerY + 16)

    $g2.Dispose()
    Write-Host "Generating specialized archive icon..."
    Save-Image-Variants -bmp $archiveBmp -baseName "archive"
    $archiveBmp.Dispose()

    $callImg.Dispose()
}

Write-Host "All icons (all call, newcall, archive, ticket, order, training) generated and optimized!"
