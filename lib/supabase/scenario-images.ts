import type { SupabaseClient } from "@supabase/supabase-js";

export const scenarioImageRules = {
  accept: "image/jpeg,image/png,image/webp,image/gif",
  maxBytes: 5 * 1024 * 1024,
};

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const bucketName = "scenario-images";

export function validateScenarioImage(file: File) {
  if (!allowedTypes.has(file.type)) {
    return "JPG, PNG, WEBP, GIF 형식의 그림만 올릴 수 있습니다.";
  }

  if (file.size > scenarioImageRules.maxBytes) {
    return "그림 파일은 5MB 이하만 올릴 수 있습니다.";
  }

  return null;
}

export async function uploadScenarioImage(
  supabase: SupabaseClient,
  scenarioId: string,
  stepId: string,
  file: File,
) {
  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${scenarioId}/${stepId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(bucketName).upload(path, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    return { error, path: null, publicUrl: null };
  }

  const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
  return { error: null, path, publicUrl: data.publicUrl };
}

export async function removeScenarioImage(supabase: SupabaseClient, imageUrl: string | null) {
  const path = getScenarioImagePath(imageUrl);
  if (!path) return;

  await supabase.storage.from(bucketName).remove([path]);
}

function getScenarioImagePath(imageUrl: string | null) {
  if (!imageUrl) return null;

  try {
    const marker = `/storage/v1/object/public/${bucketName}/`;
    const pathname = new URL(imageUrl).pathname;
    const markerIndex = pathname.indexOf(marker);
    return markerIndex === -1 ? null : decodeURIComponent(pathname.slice(markerIndex + marker.length));
  } catch {
    return null;
  }
}
