(() => {
  const compressibleImageTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
  ]);

  function normalizeQuality(value, fallback = 80) {
    const parsed = Number.parseInt(String(value ?? ""), 10);
    if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
    return Math.min(parsed, 100);
  }

  async function isAnimatedImage(file) {
    if (file.type === "image/gif") return true;
    if (!["image/png", "image/webp"].includes(file.type)) return false;
    const bytes = new Uint8Array(
      await file.slice(0, Math.min(file.size, 256 * 1024)).arrayBuffer(),
    );
    const marker = file.type === "image/png" ? "acTL" : "ANIM";
    const markerBytes = Array.from(marker, (char) => char.charCodeAt(0));
    for (
      let index = 0;
      index <= bytes.length - markerBytes.length;
      index += 1
    ) {
      if (markerBytes.every((byte, offset) => bytes[index + offset] === byte))
        return true;
    }
    return false;
  }

  function loadHtmlImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        URL.revokeObjectURL(url);
        resolve(image);
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("图片读取失败"));
      };
      image.src = url;
    });
  }

  async function decodeImage(file) {
    if (typeof createImageBitmap === "function") {
      try {
        return await createImageBitmap(file, {
          imageOrientation: "from-image",
        });
      } catch {
        // 部分浏览器不支持 imageOrientation，继续使用普通解码。
        try {
          return await createImageBitmap(file);
        } catch {
          // 回退到 HTMLImageElement。
        }
      }
    }
    return loadHtmlImage(file);
  }

  function sourceSize(image) {
    return {
      width: image.naturalWidth || image.width || 0,
      height: image.naturalHeight || image.height || 0,
    };
  }

  function quantizePng(context, width, height, quality) {
    const imageData = context.getImageData(0, 0, width, height);
    const data = imageData.data;
    // Canvas 的 PNG 编码器通常忽略 quality。通过降低颜色精度增加
    // 相邻像素的可压缩性，同时仍输出 image/png 并保持原始尺寸。
    const bits = Math.max(2, Math.min(7, Math.round(quality / 20) + 2));
    const levels = 2 ** bits - 1;
    const step = 255 / levels;
    for (let index = 0; index < data.length; index += 4) {
      if (data[index + 3] === 0) {
        data[index] = 0;
        data[index + 1] = 0;
        data[index + 2] = 0;
        continue;
      }
      data[index] = Math.round(data[index] / step) * step;
      data[index + 1] = Math.round(data[index + 1] / step) * step;
      data[index + 2] = Math.round(data[index + 2] / step) * step;
      data[index + 3] = Math.round(data[index + 3] / step) * step;
    }
    context.putImageData(imageData, 0, 0);
  }

  function canvasToBlob(canvas, type, quality) {
    return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
  }

  async function compressImageFile(file, qualityValue) {
    const quality = normalizeQuality(qualityValue);
    if (
      quality >= 100 ||
      !file.type.startsWith("image/") ||
      !compressibleImageTypes.has(file.type)
    )
      return file;

    let image;
    try {
      if (await isAnimatedImage(file)) return file;
      image = await decodeImage(file);
      const { width, height } = sourceSize(image);
      if (!width || !height) return file;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { alpha: true });
      if (!context) return file;
      context.drawImage(image, 0, 0, width, height);
      if (file.type === "image/png")
        quantizePng(context, width, height, quality);

      const blob = await canvasToBlob(canvas, file.type, quality / 100);
      canvas.width = 1;
      canvas.height = 1;
      if (!blob || blob.type !== file.type || blob.size >= file.size)
        return file;

      return new File([blob], file.name, {
        type: file.type,
        lastModified: file.lastModified,
      });
    } catch (error) {
      console.warn("图片压缩失败，改为上传原图。", error);
      return file;
    } finally {
      if (image && typeof image.close === "function") image.close();
    }
  }

  window.WorkerBlogImageCompression = Object.freeze({
    normalizeQuality,
    compressImageFile,
  });
})();
