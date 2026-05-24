import { uploadNextFile } from "@/app/utils/uploadMedia";
import { NextResponse } from "next/server";;

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const result = await uploadNextFile(file, "polls", "image");

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    });

} catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}