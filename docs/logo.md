# The logo

The logo is an artwork made with Geometrica, like any other in the app. This
document keeps the link that carries it, so every logo asset can be
re-rendered from the source instead of being edited as a picture.

## The link

Open this in the app to load the logo artwork:

```text
https://niekes.github.io/geometrica/?c=G4XgTAZARg5gpAVgEIGMD2AbNAnRAREOMAZgAYpyBGAQ2nmTQAdqUBLAFwE98RK7EkUHABMAptgBK1YawCuAZx5hIGAaXwCAdtQC2ongBk0MNBFXJ1CPAOCt5rKBn1WQ7bLNFm1GhszZcePnMkS2tkeQALakZnAkZMThNNLwsfJAAzVgwMAHk-Dm4XUhSQtPk3NABrUTyWAsCS0IEYbGlWUU12ABVOGJ4MVk1RamxGtJa2jvYAQU0YJx5i4KbkZnYInjGrAV00WU7AgDYtsKQZcupNFFiQBAAWE4FsNHZqdlY0TUCEJe9t5BQAA9Fo8AYUCL9Uv8kM9Xu9PgBhYFFUEwl5vD6aBHgkCQ0rQ8rPaoAdVYwnWgQA7KjCVVRAApNCDHjPfbCVHoLDYACSnXEAAVMG8cDxBuxxPEMG9RMSRjpUdFGBhOAjMDgAMooCKiPRdNAAURYEXVUT6LnS1Aw8k8yzS6QGjFVXN54uwkuFuHNlutqIA7mSKS4EJQVH9TtrWDAIuweMHQ1DTkJsGJJG0FF1zBDUUmU1IZOnPVnbdCc+I83J5EhM7jsyIy2nK4Wa8XTq18-IABqxkOotsVgCa3fj+NO9jEihcxxbAlLqfbIOn4VYAC8bgBOAAcpCAA
```

The `c` parameter is the compressed v2 scene (see ADR 0005). The layer inside
is named "Logo".

## Assets derived from it

| Asset                               | Size        | Where                                                      |
| ----------------------------------- | ----------- | ---------------------------------------------------------- |
| `public/logo.svg`                   | 1024 x 1024 | Navbar                                                     |
| `public/favicon.ico`                | 16, 32, 48  | Browser tab                                                |
| `public/favicon-16x16.png`          | 16 x 16     | Browser tab                                                |
| `public/favicon-32x32.png`          | 32 x 32     | Browser tab                                                |
| `public/apple-touch-icon.png`       | 180 x 180   | iOS home screen                                            |
| `public/android-chrome-192x192.png` | 192 x 192   | Android, `site.webmanifest`                                |
| `public/android-chrome-512x512.png` | 512 x 512   | Android, `site.webmanifest`                                |
| `public/og-image.jpg`               | 1200 x 630  | `og:image`, `twitter:image`                                |
| `docs/social-preview.png`           | 1280 x 640  | GitHub social preview (manual upload in the repo settings) |

`theme_color` and `background_color` in `site.webmanifest` and the
`theme-color` meta in `index.html` carry the background color of the artwork.

## Regenerating

1. Open the link above and export the SVG from the app (1024 x 1024 is the
   surface size). The export is `public/logo.svg` as it is.
2. Rasterize the SVG at 1024 px with the alpha channel preserved
   (`sips -s format png --resampleWidth 1024 logo.svg`); a thumbnailer that
   flattens onto white fills the rounded corners. Derive the favicon sizes
   from that one render.
3. The touch and Android icons and the banner formats need the square
   render: set the corner radius of the background to 0 in the app, export,
   and rasterize as in step 2. Those platforms round the corners themselves
   and fill transparent corners with a color of their own. The banners
   center the square render at full height on the background color.
4. Keep the artwork as the single source; never retouch the binaries.
