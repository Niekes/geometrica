# The logo

The logo is an artwork made with Geometrica, like any other in the app. This
document keeps the link that carries it, so every logo asset can be
re-rendered from the source instead of being edited as a picture.

## The link

Open this in the app to load the logo artwork:

```text
https://niekes.github.io/geometrica/?c=G4XgTAZARg5gpAVgEIGMD2AbNAnRAREOMAZgAZzp5k0AHAQxQEsAXAT3xAEZLEkocAJgFNsAJToDGAVwDOHTqQgZepfLwB2dALZCOAGTQw0SlWuTBGMxlAy6EBZtilCTyVfd60GLdva6ukdzxeGQALOho7AhRZZjQtAKDeADNGDAwAeXomNg5SADoEBESzJBlHNABrISzvXL9uZTdSmGwJRiF1ZgAVVkiONsk6DBKPZFb2zuYAQXUYWzzR4OR6ZlCOAFlVMFIFbdIAYSJSYgAWY4Rto52z44BaS6Jr8nu94+e7252Hq-uv0keYGe+zeOwAWkteNo0FIuvIAByQ5CScp0dQoKIgRRNQKlbBoZh0ZiMNDqDhnbGmMaoAAeixxSWQKF8BDAp0pzWp+MJxNJBzpfg5uK5BKJJPUBxZIDubKFjLKFWqAHVGAI1vI5aV0FhsABJLoiAAKmCJOA4jAN2BoJuYQiVdGwCQZpQiNAwrAOmBwAGUUKEhDpumgAKIMULe8L9PyOZxIpDJDCMGienX621Wm1m6NOFzO6koYYoWo5FlUggJpNxgDuqvVfgQnEgeeWSH9jBgoWYHAbTbLvH42GEYnasm6TQImupA6H4kko9wgrj05Es+kMiQ46xS8EK5H64XE7jgzXAA1u42j3uAJrn3ucltWYRyevbwe7ufPw+NkKMABemNOdkgA
```

The `c` parameter is the compressed v2 scene (see ADR 0005). The layer inside
is named "Logo".

## Assets derived from it

| Asset                      | Size            | Where                        |
| -------------------------- | --------------- | ---------------------------- |
| `public/logo.svg`         | 1024 x 1024     | Navbar (no background)        |
| `public/logo.webp`         | 120 x 120       | README                        |
| `public/favicon.ico`       | 16, 32, 48      | Browser tab                  |
| `public/favicon-16x16.png` | 16 x 16         | Browser tab                  |
| `public/favicon-32x32.png` | 32 x 32         | Browser tab                  |
| `public/apple-touch-icon.png` | 180 x 180    | iOS home screen             |
| `public/android-chrome-192x192.png` | 192 x 192 | Android, `site.webmanifest` |
| `public/android-chrome-512x512.png` | 512 x 512 | Android, `site.webmanifest` |
| `public/og-image.jpg`      | 1200 x 630       | `og:image`, `twitter:image`  |
| `docs/social-preview.png` | 1280 x 640       | GitHub social preview (manual upload in the repo settings) |

## Regenerating

1. Open the link above and export the SVG from the app (1024 x 1024 is the
   surface size).
2. Rasterize the SVG at 1024 px, then derive every size in the table from that
   one render. The banner formats center the square render on the black
   background of the artwork. The navbar variant `public/logo.svg` is the same
   render with the background opacity set to 0.
3. Keep the artwork as the single source; never retouch the binaries.
