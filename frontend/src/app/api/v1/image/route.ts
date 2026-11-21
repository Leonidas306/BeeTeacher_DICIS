import { type NextRequest, NextResponse } from "next/server";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id || !/^[a-zA-Z0-9_-]{10,}$/.test(id)) {
    return new NextResponse("Invalid image ID", { status: 400 });
  }

  const candidateUrls = [
    `https://lh3.googleusercontent.com/d/${id}=w1000`,
    `https://drive.google.com/thumbnail?id=${id}&sz=w1000`,
    `https://drive.google.com/uc?export=view&id=${id}`,
    `https://drive.usercontent.google.com/download?id=${id}&export=view`,
  ];

  // Dos pasadas con ligero backoff por si Google Drive aplica rate-limit al pedir 12+ fotos al mismo tiempo desde la IP de Vercel
  for (let pass = 0; pass < 2; pass++) {
    if (pass > 0) {
      await sleep(350);
    }

    for (const url of candidateUrls) {
      try {
        const res = await fetch(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
          },
          redirect: "follow",
          next: { revalidate: 86400 },
        });

        if (res.ok) {
          const contentType = res.headers.get("content-type") || "";
          if (contentType.startsWith("image/")) {
            const buffer = await res.arrayBuffer();
            if (buffer.byteLength > 100) {
              return new NextResponse(buffer, {
                status: 200,
                headers: {
                  "Content-Type": contentType,
                  // Cachear fuertemente en el CDN de Vercel (30 días) y en el navegador (7 días)
                  "Cache-Control":
                    "public, max-age=604800, s-maxage=2592000, stale-while-revalidate=86400",
                },
              });
            }
          }
        }
      } catch {
        // Intentar con el siguiente endpoint de Google Drive
      }
    }
  }

  return new NextResponse("Image not accessible", {
    status: 404,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
