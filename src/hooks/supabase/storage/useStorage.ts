import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

/**
 * Hook for uploading files to storage
 */
export function useStorageUpload(bucket: string) {
  return useMutation({
    mutationFn: async ({
      file,
      path,
      options = {},
    }: {
      file: File;
      path?: string;
      options?: {
        cacheControl?: string;
        upsert?: boolean;
      };
    }) => {
      const filePath = path ? `${path}/${file.name}` : file.name;

      const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, options);

      if (error) throw error;
      return data;
    },
  });
}

/**
 * Hook for downloading files from storage
 */
export function useStorageDownload(bucket: string) {
  return useMutation({
    mutationFn: async ({ path }: { path: string }) => {
      const { data, error } = await supabase.storage.from(bucket).download(path);
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Hook to get a public URL for a file
 */
export function useStoragePublicUrl(bucket: string, path: string | null) {
  return useQuery({
    queryKey: ["storage", bucket, path],
    queryFn: async () => {
      if (!path) return null;
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      return data?.publicUrl || null;
    },
    enabled: !!path,
  });
}

/**
 * Hook for listing files in a bucket
 */
export function useStorageList(bucket: string, path?: string) {
  return useQuery({
    queryKey: ["storage", bucket, "list", path],
    queryFn: async () => {
      const { data, error } = await supabase.storage.from(bucket).list(path || "");
      if (error) throw error;
      return data || [];
    },
  });
}

/**
 * Hook for deleting files from storage
 */
export function useStorageDelete(bucket: string) {
  return useMutation({
    mutationFn: async ({ paths }: { paths: string[] }) => {
      const { data, error } = await supabase.storage.from(bucket).remove(paths);
      if (error) throw error;
      return data;
    },
  });
}
