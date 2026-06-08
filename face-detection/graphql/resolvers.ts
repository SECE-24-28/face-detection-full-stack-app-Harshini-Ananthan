import { prisma } from "../lib/prisma";

type BoundingBox = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export const resolvers = {
  Query: {
    _empty: () => "",
  },
  Mutation: {
    detectFace: async (_: unknown, args: { imageUrl: string }) => {
      try {
        const { imageUrl } = args;

        if (!process.env.FACEPP_API_KEY || !process.env.FACEPP_API_SECRET) {
          console.error("FACEPP API keys not configured in server environment");
          throw new Error("Server configuration error");
        }

        const formData = new FormData();
        formData.append("api_key", process.env.FACEPP_API_KEY ?? "");
        formData.append("api_secret", process.env.FACEPP_API_SECRET ?? "");

        if (imageUrl.startsWith("data:")) {
          const parts = imageUrl.split(",");
          formData.append("image_base64", parts[1] ?? "");
        } else {
          formData.append("image_url", imageUrl);
        }

        const response = await fetch("https://api-us.faceplusplus.com/facepp/v3/detect", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        const faces = Array.isArray(data.faces)
          ? data.faces.map((face: any) => {
              const rect = face.face_rectangle ?? {};
              return {
                top: rect.top ?? 0,
                left: rect.left ?? 0,
                width: rect.width ?? 0,
                height: rect.height ?? 0,
              };
            })
          : [];

        try {
          await prisma.detection.create({
            data: {
              imageUrl,
              faceCount: faces.length,
            },
          });
        } catch (dbErr) {
          console.error("Prisma save failed:", dbErr);
          // proceed and return detection result even if DB write fails
        }

        return {
          imageUrl,
          faceCount: faces.length,
          faces,
        };
      } catch (err) {
        console.error("detectFace error:", err);
        throw new Error("Internal server error");
      }
    },
  },
};
