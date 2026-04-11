export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = () => resolve(String(reader.result || ''));
    reader.readAsDataURL(file);
  });
}

export async function uploadPreviewAsset(file, { bucket, supabaseClient }) {
  if (!supabaseClient) {
    return {
      url: await fileToDataUrl(file),
      source: 'Local preview',
    };
  }

  const suffix = file.name.includes('.') ? file.name.split('.').pop() : 'png';
  const path = `works/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${suffix}`;

  const { error } = await supabaseClient.storage.from(bucket).upload(path, file, {
    upsert: false,
    contentType: file.type || 'image/png',
  });

  if (error) {
    throw error;
  }

  const { data } = supabaseClient.storage.from(bucket).getPublicUrl(path);

  return {
    url: data.publicUrl,
    source: `Supabase Storage / ${bucket}`,
  };
}
